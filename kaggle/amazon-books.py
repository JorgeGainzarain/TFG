import os
import sqlite3
import random
import pandas as pd
import kagglehub
from tqdm import tqdm
from datetime import datetime
import ast

# -------------------------
# Constants
# -------------------------
HASHED_PASSWORD = "$2b$12$ri.xOUwP6iQTGKbYwnSoL.Kuyp/pN31No4IYbpcFJOBFvYL9d/P5m"
LIBRARY_TITLES = ["Leyendo", "Completados", "Por Leer", "Favoritos"]
MAX_BOOKS = 100
MAX_REVIEWS_PER_BOOK = 20
MAX_BOOKS_PER_AUTHOR = 3

# -------------------------
# Helpers
# -------------------------
def clean_list_field(value):
    if pd.isna(value):
        return ""
    if isinstance(value, str):
        try:
            parsed = ast.literal_eval(value)
            if isinstance(parsed, list):
                return ", ".join(str(x) for x in parsed if x is not None)
        except (ValueError, SyntaxError):
            pass
        return value.strip()
    return str(value)

def clean_field(value):
    if pd.isna(value):
        return ""
    return str(value).strip()

def random_date(start_year=2015, end_year=2025):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 1, 1)
    return start + (end - start) * random.random()

# -------------------------
# Download dataset
# -------------------------
print("Downloading dataset...")
path = kagglehub.dataset_download("mohamedbakhet/amazon-books-reviews")
print("Path:", path)

books_csv = os.path.join(path, "books_data.csv")
reviews_csv = os.path.join(path, "Books_rating.csv")

# -------------------------
# Load CSVs
# -------------------------
print("Loading CSVs...")
books_df = pd.read_csv(books_csv)
reviews_df = pd.read_csv(reviews_csv)

# -------------------------
# Map Titles -> bookId
# -------------------------
books_df["bookId"] = range(1, len(books_df) + 1)
title_to_id = dict(zip(books_df["Title"], books_df["bookId"]))

reviews_df["bookId"] = [title_to_id.get(title, None) for title in reviews_df["Title"]]
reviews_df = reviews_df.dropna(subset=["bookId", "User_id"]).reset_index(drop=True)

# -------------------------
# Count reviews per book
# -------------------------
book_review_counts = reviews_df.groupby("bookId").size().reset_index(name="count")
books_sorted = book_review_counts.sort_values("count", ascending=False)

# -------------------------
# Select books with author repetition
# -------------------------
selected_books = []
author_counts = {}
for _, row in books_sorted.iterrows():
    if len(selected_books) >= MAX_BOOKS:
        break
    book_id = row["bookId"]
    book_info = books_df[books_df["bookId"] == book_id].iloc[0]
    authors = clean_list_field(book_info["authors"]).split(", ")
    if all(author_counts.get(a, 0) < MAX_BOOKS_PER_AUTHOR for a in authors):
        selected_books.append(book_id)
        for a in authors:
            author_counts[a] = author_counts.get(a, 0) + 1

# -------------------------
# Limit reviews
# -------------------------
reviews_top = reviews_df[reviews_df["bookId"].isin(selected_books)]
reviews_limited = reviews_top.groupby("bookId", sort=False).head(MAX_REVIEWS_PER_BOOK).reset_index(drop=True)

# -------------------------
# Users Table
# -------------------------
unique_users = (
    reviews_limited[["User_id", "profileName"]]
    .dropna(subset=["User_id"])
    .drop_duplicates(subset=["User_id"])
    .reset_index(drop=True)
)
unique_users["User_id"] = unique_users["User_id"].astype(str)
user_id_map = {uid: idx + 1 for idx, uid in enumerate(unique_users["User_id"])}

users = pd.DataFrame({
    "id": [user_id_map[uid] for uid in unique_users["User_id"]],
    "username": [
        clean_field(name) if pd.notna(name) and str(name).strip() != "" else f"user_{user_id_map[uid]}"
        for uid, name in zip(unique_users["User_id"], unique_users["profileName"])
    ],
    "email": [f"user{user_id_map[uid]}@example.com" for uid in unique_users["User_id"]],
    "password": [HASHED_PASSWORD for _ in unique_users["User_id"]],
    "createdAt": [random_date().isoformat() for _ in unique_users["User_id"]]
})

# -------------------------
# Books Table
# -------------------------
books_selected_df = books_df[books_df["bookId"].isin(selected_books)].reset_index(drop=True)
books = pd.DataFrame({
    "bookId": books_selected_df["bookId"],
    "title": [clean_field(t) for t in books_selected_df["Title"]],
    "authors": [clean_list_field(a) for a in books_selected_df["authors"]],
    "publishedDate": [clean_field(d) for d in books_selected_df["publishedDate"]],
    "description": [clean_field(d) for d in books_selected_df["description"]],
    "pageCount": [random.randint(100, 800) for _ in range(len(books_selected_df))],
    "categories": [clean_list_field(c) for c in books_selected_df["categories"]],
    "thumbnail": [clean_field(img) for img in books_selected_df["image"]],
    "language": ["en"] * len(books_selected_df),
    "previewLink": [clean_field(l) for l in books_selected_df["previewLink"]]
})

# -------------------------
# Reviews Table
# -------------------------
reviews = pd.DataFrame({
    "id": range(1, len(reviews_limited) + 1),
    "bookId": reviews_limited["bookId"],
    "userId": [user_id_map.get(str(uid), None) for uid in reviews_limited["User_id"]],
    "rating": reviews_limited["review/score"],
    "comment": [clean_field(c) for c in reviews_limited["review/text"]],
    "createdAt": [random_date().isoformat() for _ in range(len(reviews_limited))],
    "likes": [random.randint(0, 200) for _ in range(len(reviews_limited))]
})

# -------------------------
# Save to SQLite
# -------------------------
print("Connecting to SQLite...")
conn = sqlite3.connect("../backend/src/data/dev-books.db")
cursor = conn.cursor()

# Drop tables if exist
cursor.execute("DROP TABLE IF EXISTS books;")
cursor.execute("DROP TABLE IF EXISTS users;")
cursor.execute("DROP TABLE IF EXISTS reviews;")
cursor.execute("DROP TABLE IF EXISTS libraries;")

# Create tables
cursor.execute("""
CREATE TABLE books (
    bookId INTEGER PRIMARY KEY,
    title TEXT,
    authors TEXT,
    publishedDate TEXT,
    description TEXT,
    pageCount INTEGER,
    categories TEXT,
    thumbnail TEXT,
    language TEXT,
    previewLink TEXT
);
""")
cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    email TEXT,
    password TEXT,
    createdAt TEXT
);
""")
cursor.execute("""
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY,
    bookId INTEGER,
    userId INTEGER,
    rating REAL,
    comment TEXT,
    createdAt TEXT,
    likes INTEGER
);
""")
cursor.execute("""
CREATE TABLE libraries (
    id INTEGER PRIMARY KEY,
    userId INTEGER,
    title TEXT
);
""")

# Insert data
print("Inserting Books...")
for _, row in tqdm(books.iterrows(), total=len(books)):
    cursor.execute("""
        INSERT INTO books (bookId, title, authors, publishedDate, description,
                           pageCount, categories, thumbnail, language, previewLink)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, tuple(row))

print("Inserting Users...")
for _, row in tqdm(users.iterrows(), total=len(users)):
    cursor.execute("""
        INSERT INTO users (id, username, email, password, createdAt)
        VALUES (?, ?, ?, ?, ?)
    """, tuple(row))

print("Inserting Reviews...")
for _, row in tqdm(reviews.iterrows(), total=len(reviews)):
    cursor.execute("""
        INSERT INTO reviews (id, bookId, userId, rating, comment, createdAt, likes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, tuple(row))

# Insert Libraries
print("Inserting Libraries...")
library_id = 1
for _, user in users.sort_values("id").iterrows():
    for title in LIBRARY_TITLES:
        cursor.execute("""
            INSERT INTO libraries (id, userId, title)
            VALUES (?, ?, ?)
        """, (library_id, int(user["id"]), title))
        library_id += 1

conn.commit()
conn.close()
print("✅ Data imported successfully into dev-books.db")
