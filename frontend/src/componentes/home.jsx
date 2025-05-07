import React from "react";
import "./home.css";
import Navbar from "./navbar";
import BookLabel from "./book";
import ReviewLabel from "./review";

const Home = ({ isMobile }) => (

    <div className={`home-container ${isMobile ? "mobile" : "pc"}`}>
        {!isMobile && <Navbar />}

        <main>
            <section className="banner">
                <h2>¡Bienvenido!</h2>
                <p>Descubre, organiza y disfruta tus libros favoritos.</p>
            </section>

            <section className="recommended-books">
                <h3>Libros Recomendados</h3>
                <div className="book-list">
                    <BookLabel
                        title="Libro 1"
                        author="Autor 1"
                        genres={["Genero1", "Genero2"]}
                        year="2023"
                        rating={3}
                        variant={isMobile ? "narrow" : "default"}
                    />
                    <BookLabel
                        title="Libro 2"
                        author="Autor 2"
                        genres={["Fantasía", "Aventura"]}
                        year="2021"
                        rating={4}
                        variant={isMobile ? "narrow" : "default"}
                    />
                    <BookLabel
                        title="Libro 3"
                        author="Autor 3"
                        genres={["Ciencia Ficción", "Misterio"]}
                        year="2020"
                        rating={3}
                        variant={isMobile ? "narrow" : "default"}
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

        {isMobile && <Navbar />}
    </div>
);

export default Home;