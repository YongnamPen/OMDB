//Элементы
const body = document.querySelector("body");
const search = document.getElementById("search");
const main = document.querySelector(".main");
const movieTitle = document.querySelectorAll(".movieTitle");
const movie = document.querySelector(".movie");
const movieImg = document.querySelector(".movieImg");
const movieDesc = document.querySelector(".movieDescription");
const similarMovie = document.querySelector(".similarMovie");
const similarCard = document.querySelectorAll(".similarCard");

//Кнопки
const themeBtn = document.querySelector("#themeChange");
const searchBtn = document.querySelector("#searchBtn");

//Слушатели событий
if (themeBtn) {
  themeBtn.addEventListener("click", themeChange);
}
if (search) {
  searchBtn.addEventListener("click", findMovie);
}
window.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    findMovie();
  }
});

function themeChange() {
  body.classList.toggle("dark");
}

async function findMovie() {
  const loader = document.querySelector(".loader");
  loader.style.display = "block";

  const data = { apikey: "1b7ff984", t: search.value };
  const response = await sendRequest("https://www.omdbapi.com", "GET", data);
  loader.style.display = "none";

  if (response.Response === "False") {
    main.style.display = "block";
    movie.style.display = "none";
    movieTitle[0].style.display = "block";
    movieTitle[0].innerHTML = "Введите название фильма";
  } else {
    showMovie(response);
    findSimilarMovies();
  }
}

function showMovie(data) {
  main.style.display = "block";
  movieTitle[0].style.display = "block";
  movie.style.display = "flex";
  movieImg.style.backgroundImage = `url(${data.Poster})`;
  movieTitle[0].innerHTML = data.Title;

  let params = [
    "imdbRating",
    "Year",
    "Released",
    "Genre",
    "Country",
    "Language",
    "Director",
    "Writer",
    "Actors",
  ];

  movieDesc.innerHTML = "";
  params.forEach((elem) => {
    movieDesc.innerHTML += `
                <div class="desc">
                  <p>${elem}</p>
                  <p>${data[elem]}</p>
                </div>
                `;
  });
}

async function findSimilarMovies() {
  const data = { apikey: "1b7ff984", s: search.value };
  const response = await sendRequest("https://www.omdbapi.com", "GET", data);
  movieTitle[1].style.display = "block";
  movieTitle[1].innerHTML = `Найдено похожих фильмов: ${response.Search.length}`;
  showSimilarMovies(response.Search);
}

function showSimilarMovies(movies) {
  const similarMovies = document.querySelector(".similarMovies");
  similarMovies.innerHTML = "";
  similarMovies.style.display = "grid";
  for (let i = 0; i < movies.length; i++) {
    let movie = movies[i];
    if (movie.Poster != "N/A") {
      let similarMovie = `
        <div class="similarCard" style="background-image:url(${movie.Poster})">
          <div class="similar active" onclick="addSaved(event)" 
          data-poster="${movie.Poster}" 
          data-title="${movie.Title}" 
          data-imdbID="${movie.imdbID}">
          </div>
          <p>${movie.Title}</p>
        </div>`;

      similarMovies.innerHTML += similarMovie;
    }
  }
}

function addSaved(event) {
  const target = event.currentTarget;
  const movieDate = {
    title: target.getAttribute("data-title"),
    poster: target.getAttribute("data-poster"),
    imdbID: target.getAttribute("data-imdbID"),
  };

  let fav = JSON.parse(localStorage.getItem("fav")) || [];
  let movieIndex = fav.findIndex((movie) => movie.imdbID === movieDate.imdbID);

  if (movieIndex > -1) {
    fav.splice(movieIndex, 1);
    target.classList.remove("star");
  } else {
    fav.push(movieDate);
    target.classList.add("star");
  }
  localStorage.setItem("fav", JSON.stringify(fav));
  if (window.location.pathname.includes("favorite.html")) {
    displayFavorites();
  }
}

function displayFavorites() {
  main.style.display = "block";
  const favorites = JSON.parse(localStorage.getItem("fav")) || [];
  const favCards = document.querySelector(".favoriteMovies");
  favCards.innerHTML = "";

  if (favorites.length === 0) {
    favCards.innerHTML = "<p>Избранные фильмы не найдены</p>";
    return;
  }

favorites.forEach((movie) => {
  let movieCards = `
    <div class="similarCard" style="background-image:url(${movie.poster})">
      <div class="similar active" onclick="addSaved(event)" 
        data-poster="${movie.poster}" 
        data-title="${movie.title}" 
        data-imdbID="${movie.imdbID}">
      </div>
      <p>${movie.title}</p>
    </div>`;
    favCards.innerHTML += movieCards;
  });
}

async function sendRequest(url, method, data) {
  if (method == "POST") {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    response = await response.json();
    return response;
  } else if (method == "GET") {
    url = url + "?" + new URLSearchParams(data);
    let response = await fetch(url, {
      method: "GET",
    });
    response = await response.json();
    return response;
  }
}
