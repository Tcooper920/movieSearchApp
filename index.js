
const movieListContainer = document.getElementById("movie-list-container");
const searchField = document.getElementsByClassName("search-field")[0];
const movieTitle = document.getElementsByClassName("movie-title")[0];
const movieSummary = document.getElementsByClassName("movie-summary")[0];
const whereToBuyContainer = document.getElementsByClassName("where-to-buy-container")[0];
const whereToRentContainer = document.getElementsByClassName("where-to-rent-container")[0];

// Fetch request from movie database...
const getMovies = async (searchFieldValue) => {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${searchFieldValue}&api_key=${apiKey}`);
    const responseItems = await response.json();

    printSearchResults(responseItems);
}

// Fetch movie providers from database...
const getMovieProviders = async (movieId) => {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`);
    const responseItems = await response.json();
    let whereToBuyAndRent = responseItems.results.US;

    printMovieProviders(whereToBuyAndRent);
}

// Default movies to fetch...
getMovies("Avengers");

// Print movie providers to page...
function printMovieProviders (whereToBuyAndRent) {
    whereToBuyAndRent.buy.forEach(movie => {
        whereToBuyContainer.innerHTML += `<span class='buy-provider'>${movie.provider_name}</span>`
    });
    whereToBuyAndRent.rent.forEach(movie => {
        whereToRentContainer.innerHTML += `<span class='rent-provider'>${movie.provider_name}</span>`
    });
}

// Search for movies with each keydown event...
searchField.addEventListener("keydown", () => {
    let searchFieldValue = searchField.value;

    clearAllMovieDescriptionData();
    
    getMovies(searchFieldValue);
});

// Function to clear movie description data in sidebar...
const clearAllMovieDescriptionData = () => {
    movieListContainer.innerHTML = "";
    whereToBuyContainer.innerHTML = "";
    whereToRentContainer.innerHTML = "";
    movieTitle.innerHTML = "";
    movieSummary.innerHTML = "";
}

// Function to format strings and escape single quotes...
function escapeSingleQuotes (stringToFormat) {
    return stringToFormat.replace(/'/g, "&#39;")
}

// Function to format movie release dates (only print the year – not the day and month)
function formatDate (dateToFormat) {

    let formattedDate = dateToFormat.split("-").reverse().pop();

    return formattedDate;
}

// Print movies to web page...
function printSearchResults(responseItems) {
    responseItems.results.forEach(result => {

        movieListContainer.innerHTML += `
        <div
            role="button" 
            tabindex="1" 
            class='movie-container' 
            data-title='${result.original_title}'
            data-rating='${result.vote_average}'
            data-overview='${escapeSingleQuotes(result.overview)}' 
            data-result-id='${result.id}'
        >
            <img 
                src='https://image.tmdb.org/t/p/w500/${result.poster_path}' 
                alt='${result.original_title}' 
                class='movie-image'
            >
            <p 
                class='title'>${result.original_title}<br>
                <em class='date'>${formatDate(result.release_date)}</em>
            </p>
        </div>`;
    });

    loadFirstDefaultMovieSummaryOnPageLoad()
}

// Display first movie summary on page load with each new search...
function loadFirstDefaultMovieSummaryOnPageLoad() {
    const firstDefaultMovieInList = document.getElementsByClassName("movie-container")[0];
    const firstDefaultMoviePosterInList = document.querySelector(".movie-container > img");
    let thisMovieTitle = firstDefaultMovieInList.getAttribute("data-title");
    let thisMovieSummary = firstDefaultMovieInList.getAttribute("data-overview");
    let thisMovieId = firstDefaultMovieInList.getAttribute("data-result-id");
    let thisMovieRating = firstDefaultMovieInList.getAttribute("data-rating");

    displayMovieInfoInSidebar(firstDefaultMoviePosterInList, thisMovieTitle, thisMovieSummary, thisMovieId, thisMovieRating);
}

// Display movie summary in sidebar along with streaming providers - onclick...
movieListContainer.addEventListener("click", (event) => {
    if (event.target.parentNode.classList.contains("movie-container")) {
        let thisMovieTitle = event.target.parentNode.getAttribute("data-title");
        let thisMovieSummary = event.target.parentNode.getAttribute("data-overview");
        let thisMovieId = event.target.parentNode.getAttribute("data-result-id");
        let thisMovieImage = event.target.closest(".movie-image");
        let thisMovieRating = event.target.parentNode.getAttribute("data-rating");

        whereToBuyContainer.innerHTML = "";
        whereToRentContainer.innerHTML = "";

        displayMovieInfoInSidebar(thisMovieImage, thisMovieTitle, thisMovieSummary, thisMovieId, thisMovieRating);
    }
});

// Keyboard accessibility - pressing 'Enter' on a movie to display its info in the sidebar...
movieListContainer.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        if (document.activeElement.classList.contains("movie-container")) {
            let thisMovieTitle = document.activeElement.getAttribute("data-title");
            let thisMovieSummary = document.activeElement.getAttribute("data-overview");
            let thisMovieId = document.activeElement.getAttribute("data-result-id");
            let thisMovieImage = document.activeElement;

            whereToBuyContainer.innerHTML = "";
            whereToRentContainer.innerHTML = "";

            displayMovieInfoInSidebar(thisMovieImage, thisMovieTitle, thisMovieSummary, thisMovieId)
        }
    }
});

// Function to display all movie info in sidebar, and highlight current movie poster...
const displayMovieInfoInSidebar = (selectedMovieImageToHighlight, selectedMovieTitle, selectedMovieSummary, selectedMovieId, selectedMovieRating) => {
    
    // Remove previously highlighted movie poster image...
    if (document.querySelector(".movie-img-outline")) {
        document.querySelector(".movie-img-outline").classList.remove("movie-img-outline");
    }
    
    // Highlight the selected movie poster image...
    selectedMovieImageToHighlight.classList.add("movie-img-outline");

    // Display movie title...
    movieTitle.innerHTML = `<h1>${selectedMovieTitle}</h1>
                            ${formatMovieRatingAndColorBar(selectedMovieRating)}`;
        
    // Display movie summary...
    movieSummary.innerHTML = selectedMovieSummary;

    // Display movie providers...
    getMovieProviders(selectedMovieId);
}

// Format movie rating...
function formatMovieRatingAndColorBar(selectedMovieRating) {
    selectedMovieRating = selectedMovieRating * 10;
    let colorBarColor;

    if (selectedMovieRating >= 80) {
        colorBarColor = "#79cf5f";
    } else if (selectedMovieRating >= 60) {
        colorBarColor = "#becf5f";
    } else if (selectedMovieRating >= 50) {
        colorBarColor = "#deda5d";
    } else if (selectedMovieRating >= 30) {
        colorBarColor = "#f5a836";
    } else {
        colorBarColor = "#e64747";
    }

    let movieRatingHTML = `
        <span class="movie-rating">
            <span style='color:${colorBarColor};'>${selectedMovieRating}%</span> / 100
        </span><br>
        <div class="movie-rating-color-bar">
            <div 
                class='color-bar'
                style='width: ${selectedMovieRating}%; 
                background-color: ${colorBarColor};'
            </div>
        </div>`;

    return movieRatingHTML;
}

