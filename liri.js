require("dotenv").config();

const fs = require("fs");
const axios = require("axios");
const keys = require("./keys.js");
const Spotify = require("node-spotify-api");
const moment = require("moment");
const inquirer = require("inquirer");

let spotify = new Spotify(keys.spotify);

let userCommand = process.argv[2];
let userSearch = process.argv.slice(3).join(" ");

let main = function(userCommand, userSearch) {
  // case will be run depending on what user inputs
  switch (userCommand) {
    case "concert-this":
      return searchConcert(userSearch);
      // no break statement because we're returning something

    case "spotify-this-song":
      return searchSpotify(userSearch);
      // no break statement because we're returning something

    case "movie-this":
      return searchMovie(userSearch);
      // no break statement because we're returning something

    case "do-what-it-says":
      return randomSearch();
      // no break statement because we're returning something

    default:
      console.log("Invalid command");
  }
};

let searchConcert = function(artist) {

  let bandsURL = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`;

  // requests data for artist
  return axios
    .get(bandsURL)
    .then(function(response) {
      let data = response.data[0];

      function venueData() {
        console.log(`
        Venue : ${data.venue.name}
        Location : ${data.venue.city}
        Date : ${moment(data.datetime).format("MM/DD/YYYY")}
        `);
      }

      data ? venueData() : console.log("Sorry, they're not on tour :(");

    })
    .catch(function(error) {
      // handle error
      console.log(error);
    });
};

let searchSpotify = function(song) {

  let urlArtist = "";
    // if no song was entered, defaults to The Sign by Ace
  if (!song) {
    song = "The Sign";
    urlArtist = "%20ace";
  }
  return spotify
    .request(
      `https://api.spotify.com/v1/search?q=${song}${urlArtist}&type=track,artist`
    )
    .then(function(data) {
      // displays data for song
      const item = data.tracks.items[0];

      console.log(`
      Artist : ${item.artists[0].name}
      Song : ${item.name}
      Link : ${item.external_urls.spotify}
      Album : ${item.album.name}
      `);
    }).catch(err => Promise.reject(err))
  
};

let searchMovie = function(movie) {
  // if no movie name was entered, defaults to Mr. Nobody
  if (!movie) {
    movie = "Mr. Nobody";
  }

  let movieURL = `https://www.omdbapi.com/?apikey=trilogy&t=${movie}&type=movie&plot=short`;

  // requests data from api than displays info
  return axios.get(movieURL).then(function(response) {
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
  return new Promise((resolve, reject) => {

    fs.readFile("random.txt", "utf8", function(err, data) {
      // logs if error
      // if error, return reject error (short circuit)
      err && reject(err);
  
      // split content with comma
      let dataArr = data.split(",");
  
      // returning resolved promise
      return resolve({

        userCommand : dataArr[0],
        userSearch : dataArr[1]

      });
    });
  // destructuring resolved object
  }).then(({userCommand, userSearch}) => main(userCommand, userSearch))
  // main returns promise so we use a then
  .then(() => promptStart());
};

const promptStart = () => {

  inquirer.prompt(
    {
      name: "command",
      type: "list",
      message: "What command would you like to search for?",
      choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says", "exit"]
    }
  ).then((res) => {
    if (res.command !== "do-what-it-says" && res.command !== "exit") searchPrompt(res.command);
    else if (res.command === "do-what-it-says") randomSearch();
  })

}

const searchPrompt = (promptCommand) => {

  inquirer.prompt(
    {
      name: "search",
      type: "input",
      message: "What would you like to search for?"
    }
  // destructuring inquirer object
  ).then(({search}) => main(promptCommand, search)
  // main returns promise
  ).then(() => promptStart()
  ).catch(err => console.log(err));

}
// if user types command, it searches
// else opens inquirer
userCommand ? main(userCommand, userSearch) : promptStart();