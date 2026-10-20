const API_KEY = "e5c32837";
const API_URL = "https://www.omdbapi.com/";

const form = document.getElementById("search-form");
const input = document.getElementById("movie-title");
const button = document.getElementById("search-button");
const statusEl = document.getElementById("status");
const card = document.getElementById("movie-card");

const els = {
  name: document.getElementById("movie-name"),
  meta: document.getElementById("movie-meta"),
  genre: document.getElementById("movie-genre"),
  plot: document.getElementById("movie-plot"),
  poster: document.getElementById("movie-poster"),
  rating: document.getElementById("movie-rating"),
  director: document.getElementById("movie-director"),
  actors: document.getElementById("movie-actors"),
};

// A simple grey placeholder shown when a film has no poster
const POSTER_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <rect width="300" height="450" fill="#d9dce2"/>
      <text x="150" y="230" font-family="sans-serif" font-size="18" fill="#7b8190" text-anchor="middle">No poster</text>
    </svg>`,
  );

form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchMovie();
});

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

// OMDb returns "N/A" for missing values
function clean(value, fallback = "Not available") {
  return value && value !== "N/A" ? value : fallback;
}

async function searchMovie() {
  const title = input.value.trim();

  if (!title) {
    setStatus("Enter a movie title to search.", true);
    return;
  }

  button.disabled = true;
  card.hidden = true;
  setStatus("Searching…");

  try {
    const url = `${API_URL}?t=${encodeURIComponent(title)}&plot=short&apikey=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const movie = await response.json();

    if (movie.Response === "False") {
      setStatus(
        `No results for “${title}”. Check the spelling or try another title.`,
        true,
      );
      return;
    }

    showMovie(movie);
    setStatus("");
  } catch (error) {
    console.error(error);
    setStatus(
      "Something went wrong. Check your internet connection and try again.",
      true,
    );
  } finally {
    button.disabled = false;
  }
}

function showMovie(movie) {
  els.name.textContent = movie.Title;

  els.meta.textContent = [movie.Year, movie.Runtime, movie.Rated]
    .filter((item) => item && item !== "N/A")
    .join(" · ");

  els.genre.textContent = clean(movie.Genre, "");
  els.plot.textContent = clean(movie.Plot, "No plot summary available.");

  els.rating.textContent =
    movie.imdbRating && movie.imdbRating !== "N/A"
      ? `${movie.imdbRating} / 10`
      : "Not rated";
  els.director.textContent = clean(movie.Director);
  els.actors.textContent = clean(movie.Actors);

  els.poster.src = clean(movie.Poster, "") || POSTER_PLACEHOLDER;
  els.poster.alt = `Poster for ${movie.Title}`;
  els.poster.onerror = () => {
    els.poster.onerror = null;
    els.poster.src = POSTER_PLACEHOLDER;
  };

  card.hidden = false;
}
