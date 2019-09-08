require("dotenv").config();

const fs = require("fs");
const axios = require("axios");
const keys = require("./keys.js");
const Spotify = require("node-spotify-api");
const moment = require("moment");

let spotify = new Spotify(keys.spotify);

let userCommand = process.argv[2];
let userSearch = process.argv[3];

let main = function(userCommand, userSearch) {
  // case will be run depending on what user inputs
  switch (userCommand) {
    case "concert-this":
      searchConcert(userSearch);
      break;

    case "spotify-this-song":
      searchSpotify(userSearch);
      break;

    case "movie-this":
      searchMovie(userSearch);
      break;

    case "do-what-it-says":
      randomSearch();
      break;

    default:
      console.log("Invalid command");
  }
};

let searchConcert = function(artist) {
  let bandsURL = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`;

  // requests data for artist
  axios
    .get(bandsURL)
    .then(function(response) {
      // displays data
      console.log("Venue : " + response.data[0].venue.name);
      console.log("Location : " + response.data[0].venue.city);
      console.log(
        "Date : " + moment(response.data[0].datetime).format("MM/DD/YYYY")
      );
    })
    .catch(function(error) {
      // handle error
      console.log(error);
    });
};

let searchSpotify = function(song) {
  // if no song was entered, defaults to The Sign
  if (!song) {
    song = "The Sign";
    spotify
      .request(
        `https://api.spotify.com/v1/search?q=${song}%20ace&type=track,artist`
      )
      .then(function(data) {
        // displays data for song
        console.log(`
      Artist : ${data.tracks.items[0].artists[0].name}
      Song : ${data.tracks.items[0].name}
      Link : ${data.tracks.items[0].external_urls.spotify}
      Album : ${data.tracks.items[0].album.name}
      `);
      });
  } else {
    // searches through spotify's api for song
    spotify.search({ type: "track", query: song }, function(err, data) {
      // logs error
      if (err) {
        return console.log("Error occurred: " + err);
      }

      // displays data for song
      console.log(`
      Artist : ${data.tracks.items[0].artists[0].name}
      Song : ${data.tracks.items[0].name}
      Link : ${data.tracks.items[0].external_urls.spotify}
      Album : ${data.tracks.items[0].album.name}
      `);
    });
  }
};

let searchMovie = function(movie) {
  // if no movie name was entered, defaults to Mr. Nobody
  if (!movie) {
    movie = "Mr. Nobody";
  }

  let movieURL = `https://www.omdbapi.com/?apikey=trilogy&t=${movie}&type=movie&plot=short`;

  // requests data from api than displays info
  axios.get(movieURL).then(function(response) {
    console.log(`
    Title : ${response.data.Title}
    Release Year : ${response.data.Year}
    IMDB Rating : ${response.data.Rated}
    Rotten Tomatoes Rating : ${response.data.Ratings[1].Value}
    Country : ${response.data.Country}
    Language : ${response.data.Language}
    Plot : ${response.data.Plot}
    Actors : ${response.data.Actors}
    `);
  });
};

let randomSearch = function() {
  // gets data from text file
  fs.readFile("random.txt", "utf8", function(error, data) {
    // logs if error
    if (error) {
      return console.log(error);
    }

    // split content with comma
    var dataArr = data.split(",");

    userCommand = dataArr[0];
    userSearch = dataArr[1];

    // calls main function to run command/search
    main(userCommand, userSearch);
  });
};

// runs app with user command/search
main(userCommand, userSearch);
