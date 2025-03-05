import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useParams } from "react-router-dom";
import "./App.css";

// API key and URLs for OMDb API
const API_KEY = "68c60319";
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&s=`;
const MOVIE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&i=`;

// Main App component
function App() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on initial load
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  }, []);

  // Function to search for movies from the OMDb API
  const searchMovies = async (query) => {
    if (!query) return;
    try {
      const response = await fetch(API_URL + query);
      const data = await response.json();
      if (data.Search) {
        setMovies(data.Search);
      } else {
        setMovies([]); // Clear results if no movies found
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Function to add a movie to favorites
  const addFavorite = (movie) => {
    const updatedFavorites = [...favorites, movie];
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // Function to remove a movie from favorites
  const removeFavorite = (movie) => {
    const updatedFavorites = favorites.filter((fav) => fav.imdbID !== movie.imdbID);
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  return (
    <Router>
      <div className="container">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/favorites">Favorites</Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <input
                  type="text"
                  placeholder="Search for movies..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    searchMovies(e.target.value);
                  }}
                />
                <div className="movies">
                  {movies.length > 0 ? (
                    movies.map((movie) => (
                      <div key={movie.imdbID} className="movie">
                        <Link to={`/movie/${movie.imdbID}`}>
                          <img src={movie.Poster} alt={movie.Title} />
                          <h3>{movie.Title}</h3>
                        </Link>
                        <button onClick={() => addFavorite(movie)}>❤️ Favorite</button>
                      </div>
                    ))
                  ) : (
                    <p>No movies found. Try another search.</p>
                  )}
                </div>
              </div>
            }
          />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route
            path="/favorites"
            element={<Favorites favorites={favorites} removeFavorite={removeFavorite} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

// MoviePage component to show detailed information about a movie
function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(MOVIE_URL + id);
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };
    fetchMovie();
  }, [id]);

  if (!movie) return <h2>Loading...</h2>;

  return (
    <div className="movie-page">
      <h2>{movie.Title}</h2>
      <img src={movie.Poster} alt={movie.Title} />
      <p>{movie.Plot}</p>
      <p><strong>Year:</strong> {movie.Year}</p>
      <p><strong>Genre:</strong> {movie.Genre}</p>
    </div>
  );
}

// Favorites component to show user's favorite movies
function Favorites({ favorites, removeFavorite }) {
  return (
    <div className="favorites">
      <h2>My Favorite Movies</h2>
      {favorites.length === 0 ? <p>No favorites yet.</p> : null}
      <div className="movies">
        {favorites.map((movie) => (
          <div key={movie.imdbID} className="movie">
            <img src={movie.Poster} alt={movie.Title} />
            <h3>{movie.Title}</h3>
            <button onClick={() => removeFavorite(movie)}>❌ Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
