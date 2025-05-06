import './book.css';

function BookLabel(
    {
        title = "Titulo Default",
        author = "Autor Default",
        genres = ["Genero1", "Genero2"],
        rating = 2.5,
        year = "XXXX",
        cover = "/cover_placeholder.png",
        variant = "default"
    }) {
    const ratingPercent = `${(rating) / 5 * 100}%`;
    const isNarrow = variant === "narrow";

    return (
        <div className={`book-label ${isNarrow ? "book-label-narrow" : ""}`}>
            <img src={cover || "/cover_placeholder.png"} alt={`Portada de ${title}`} className="book-cover" />
            <div className="book-info">
                <h3 className="book-title">{title}</h3>
                <p><strong>Autor:</strong> {author}</p>
                <p><strong>Géneros:</strong> {genres.join(", ")}</p>
            </div>
            <div className="book-meta">
            <div className="rating">
                    <div className="stars-outer">
                        <div className="stars-inner" style={{ width: ratingPercent }}></div>
                    </div>
                </div>
                <p><strong>Año:</strong> {year}</p>
                <button className="add-button">Añadir a la Libreria</button>
            </div>
        </div>
    );
}

export default BookLabel;