import React from "react";
import "./home.css";
import Navbar from "./navbar"; // Import the Navbar component
import BookLabel from "./book";
import ReviewLabel from "./review";

const Home = () => (
    <div className="home-container">
        <Navbar /> {/* Use the Navbar component */}

        <main>
            <section className="banner">
                <h2>¡Bienvenido a tu biblioteca digital!</h2>
                <p>Descubre, organiza y disfruta tus libros favoritos.</p>
            </section>

            <section className="recommended-books">
                <h3>Libros Recomendados</h3>
                <div className="book-list">
                    <BookLabel
                        title="Titulo Default"
                        author="Autor Default"
                        genres={["Genero1", "Genero2"]}
                        year="XXXX"
                        rating={3}
                        variant="narrow"
                    />
                    <BookLabel
                        title="Libro 2"
                        author="Autor 2"
                        genres={["Fantasía", "Aventura"]}
                        year="2021"
                        rating={4}
                        variant="narrow"
                    />
                    <BookLabel
                        title="Libro 3"
                        author="Autor 3"
                        genres={["Ciencia Ficción", "Misterio"]}
                        year="2020"
                        rating={3}
                        variant="narrow"
                    />
                </div>
            </section>

            <section className="highlighted-reviews">
                <h3>Reseñas Destacadas</h3>
                <div className="reviews-list">
                    <ReviewLabel
                        user="Usuario1"
                        date="01/01/2023"
                        text="Un libro cautivador de principio a fin."
                        likes={45}
                        rating={5}
                    />
                    <ReviewLabel
                        user="Usuario2"
                        date="15/02/2023"
                        text="Una historia que me dejó reflexionando por días."
                        likes={30}
                        rating={4}
                    />
                    <ReviewLabel
                        user="Usuario3"
                        date="20/03/2023"
                        text="No cumplió mis expectativas, pero tiene puntos rescatables."
                        likes={12}
                        rating={3}
                    />
                </div>
            </section>
        </main>
    </div>
);

export default Home;