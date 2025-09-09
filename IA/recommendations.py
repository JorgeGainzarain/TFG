import sqlite3
import pandas as pd
import numpy as np
import networkx as nx
from itertools import combinations
from sklearn.preprocessing import MultiLabelBinarizer, OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from node2vec import Node2Vec
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Concatenate
from tensorflow.keras.optimizers import Adam
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeRemainingColumn

DB_PATH = "../backend/src/data/dev-books.db"
console = Console()


def load_data(db_path: str) -> dict:
    conn = sqlite3.connect(db_path)
    tables = pd.read_sql_query("SELECT name FROM sqlite_master WHERE type='table';", conn)
    dataframes = {t: pd.read_sql_query(f"SELECT * FROM {t}", conn) for t in tables["name"]}
    conn.close()
    return dataframes


def build_svd_embeddings(ratings: pd.DataFrame, n_components: int = 10):
    user_item = ratings.groupby(["userId", "bookId"])["rating"].mean().unstack(fill_value=0)

    np.random.seed(42)
    mask = np.random.rand(*user_item.shape) < 0.2
    train_matrix = user_item.copy()
    train_matrix[mask] = 0

    svd = TruncatedSVD(n_components=n_components, random_state=42)
    svd.fit(train_matrix)

    P = svd.transform(train_matrix)      # user embeddings
    Q = svd.components_.T                # book embeddings

    user_ids = user_item.index.to_numpy()
    book_ids = user_item.columns.to_numpy()
    user_map = {uid: i for i, uid in enumerate(user_ids)}
    book_map = {bid: i for i, bid in enumerate(book_ids)}

    return P, Q, user_ids, book_ids, user_map, book_map


def build_graph_embeddings(books: pd.DataFrame, dimensions=32, walk_length=5, num_walks=20):
    console.rule("[bold green]📊 Construyendo embeddings de grafos")

    # Grafo vacío
    G = nx.Graph()
    # Añadir nodos
    for idx, row in books.iterrows():
        G.add_node(str(row['bookId']),
                   title=row['title'],
                   categories=row['categories'],
                   authors=row['authors'],
                   language=row['language'])

    # ----- 1. Categories -----
    categories_list = books['categories'].apply(lambda x: x.split(',') if isinstance(x, str) else [])
    mlb_cat = MultiLabelBinarizer()
    cat_matrix = mlb_cat.fit_transform(categories_list)
    cat_sim = cosine_similarity(cat_matrix)

    # ----- 2. Authors -----
    authors_list = books['authors'].fillna('Unknown').values.reshape(-1,1)
    ohe_authors = OneHotEncoder(sparse_output=False)
    author_matrix = ohe_authors.fit_transform(authors_list)
    author_sim = cosine_similarity(author_matrix)

    # ----- 3. Language -----
    lang_list = books['language'].fillna('unknown').values.reshape(-1,1)
    ohe_lang = OneHotEncoder(sparse_output=False)
    lang_matrix = ohe_lang.fit_transform(lang_list)
    lang_sim = cosine_similarity(lang_matrix)

    # ----- 4. Combinar similitudes con pesos -----
    w_cat, w_author, w_lang = 0.5, 0.3, 0.2
    combined_sim = w_cat*cat_sim + w_author*author_sim + w_lang*lang_sim

    # ----- 5. Crear aristas -----
    threshold = 0.3
    for i, j in combinations(range(len(books)), 2):
        if combined_sim[i,j] > threshold:
            G.add_edge(str(books.loc[i,'bookId']), str(books.loc[j,'bookId']), weight=combined_sim[i,j])

    # --- Node2Vec ---
    node2vec = Node2Vec(
        G,
        dimensions=dimensions,
        walk_length=walk_length,
        num_walks=num_walks,
        workers=4,
        weight_key='weight'
    )
    model = node2vec.fit(window=3, min_count=1, batch_words=4)
    return model


def prepare_training_data(ratings, P, Q, user_map, book_map, graph_model=None, books_df=None):
    # Si hay modelo de grafos, alinear embeddings con libros SVD
    if graph_model is not None and books_df is not None:
        book_ids_svd = np.array(list(book_map.keys())).astype(str)
        graph_emb_dict = {str(bid): emb for bid, emb in zip(books_df['bookId'].astype(str),
                                                            [graph_model.wv[str(b)] for b in books_df['bookId']])}
        book_embeddings_graph_aligned = np.array([graph_emb_dict[bid] for bid in book_ids_svd])
        Q = np.hstack([Q, book_embeddings_graph_aligned])

    data = [
        (P[user_map[row["userId"]]], Q[book_map[row["bookId"]]], row["rating"])
        for _, row in ratings.iterrows()
    ]
    X_user = np.array([x[0] for x in data])
    X_book = np.array([x[1] for x in data])
    y = np.array([x[2] for x in data])
    return X_user, X_book, y, Q


def build_mlp(k_user, k_book):
    user_input = Input(shape=(k_user,))
    book_input = Input(shape=(k_book,))
    x = Concatenate()([user_input, book_input])
    x = Dense(128, activation="relu")(x)
    x = Dense(64, activation="relu")(x)
    rating_output = Dense(1, activation="linear")(x)

    model = Model(inputs=[user_input, book_input], outputs=rating_output)
    model.compile(optimizer=Adam(0.001), loss="mse")
    return model


def generate_predictions(model, P, Q, user_ids, book_ids, batch_size=512):
    preds = []
    with Progress(
            SpinnerColumn(),
            TextColumn("[bold blue]{task.description}"),
            BarColumn(),
            TextColumn("{task.percentage:>3.0f}%"),
            TimeRemainingColumn(),
            console=console,
    ) as progress:

        task_users = progress.add_task("Generando predicciones", total=len(user_ids))

        for u_idx, user_id in enumerate(user_ids):
            user_emb = np.repeat(P[u_idx].reshape(1, -1), len(book_ids), axis=0)
            book_emb = Q

            # Procesamos en lotes
            user_preds = []
            for i in range(0, len(book_ids), batch_size):
                batch_user = user_emb[i:i+batch_size]
                batch_book = book_emb[i:i+batch_size]
                batch_preds = model.predict([batch_user, batch_book], verbose=0).flatten()
                user_preds.extend(batch_preds)
                progress.advance(task_users, advance=batch_size / len(book_ids) * 100)

            preds.extend((user_id, book_id, pred) for book_id, pred in zip(book_ids, user_preds))
            progress.advance(task_users)

    return pd.DataFrame(preds, columns=["userId", "bookId", "predicted_rating"])


def save_recommendations(db_path, recommendations):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS recommendations;")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            userId INTEGER,
            bookId INTEGER,
            predicted_rating REAL
        );
    """)
    recommendations.to_sql("recommendations", conn, if_exists="append", index=False)
    conn.commit()
    conn.close()

def main():
    console.rule("[bold green]📂 Cargando datos")
    dataframes = load_data(DB_PATH)
    reviews = dataframes.get("reviews", pd.DataFrame())
    ratings = reviews[["userId", "bookId", "rating"]]
    df_books = dataframes.get("books", pd.DataFrame())
    books = df_books[['bookId', 'title', 'categories', 'authors', 'language']]
    console.log(f"Total de libros: {len(books)}")

    console.rule("[bold green]⚙️ Calculando embeddings SVD")
    P, Q, user_ids, book_ids, user_map, book_map = build_svd_embeddings(ratings)

    console.rule("[bold green]🔗 Construyendo embeddings de grafos")
    graph_model = build_graph_embeddings(books)

    console.rule("[bold green]🧩 Preparando datos de entrenamiento")
    X_user, X_book, y, Q_combined = prepare_training_data(ratings, P, Q, user_map, book_map, graph_model, books)

    console.rule("[bold green]🧠 Entrenando red neuronal híbrida")
    model_combined = build_mlp(P.shape[1], Q_combined.shape[1])
    model_combined.fit([X_user, X_book], y, epochs=20, batch_size=128, validation_split=0.1, verbose=1)

    console.rule("[bold green]🔮 Generando predicciones")
    predictions = generate_predictions(model_combined, P, Q_combined, user_ids, book_ids)

    top_25 = (
        predictions.sort_values(["userId", "predicted_rating"], ascending=[True, False])
        .groupby("userId")
        .head(25)
        .reset_index(drop=True)
    )

    console.rule("[bold green]📊 Guardando recomendaciones en la base de datos")
    save_recommendations(DB_PATH, top_25)

    console.rule("[bold green]✅ Proceso completado")



if __name__ == "__main__":
    main()
