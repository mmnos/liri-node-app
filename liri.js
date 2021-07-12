require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const keys = require('./spotify-keys.js');
const Spotify = require('node-spotify-api');
const inquirer = require('inquirer');
const utils = require('./utils');

const spotify = new Spotify(keys.spotify);

const userCommand = process.argv[2];
const userSearch = process.argv.slice(3).join(' ');

const main = (userCommand, userSearch) => {
  // case will be run depending on what user inputs
  // no break statement because we're returning something
  switch (userCommand) {
    case 'concert-this':
      return searchConcert(userSearch);

    case 'spotify-this-song':
      return searchSpotify(userSearch);

    case 'movie-this':
      return searchMovie(userSearch);

    case 'do-what-it-says':
      return randomSearch();

    default:
      console.log('Invalid command');
  }
};

// takes user input and gets bands data
const searchConcert = async (artist) => {
  const bandsURL = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`;

  // requests data for artist
  const bandsData = await axios.get(bandsURL);
  const data = bandsData.data[0];

  data
    ? utils.displayVenueData(data)
    : console.log("Sorry, they're not on tour :(");
};

// takes user input and gets music data
const searchSpotify = async (song) => {
  let urlArtist = '';

  // if no song was entered, defaults to The Sign by Ace
  if (!song) {
    song = 'The Sign';
    urlArtist = '%20ace';
  }

  const musicURL = `https://api.spotify.com/v1/search?q=${song}${urlArtist}&type=track,artist`;

  const musicData = await spotify.request(musicURL);
  // console.log('ITEMS: ', musicData);
  const item = musicData.tracks.items[0];

  utils.displayMusicData(item);
};

// takes user input and gets movie data
const searchMovie = async (movie) => {
  // if no movie name was entered, defaults to Mr. Nobody
  if (!movie) {
    movie = 'Mr. Nobody';
  }

  const movieURL = `https://www.omdbapi.com/?apikey=trilogy&t=${movie}&type=movie&plot=short`;

  // requests data from api than displays info
  const movieData = await axios.get(movieURL);

  utils.displayMovieData(movieData);
};

// gets data from txt file and displays it
const randomSearch = async () => {
  // gets data from text file
  const getDataFromTextFile = await new Promise((resolve, reject) => {
    fs.readFile('random.txt', 'utf8', (err, data) => {
      // if error, return reject error (short circuit)
      err && reject(err);

      // split content with comma
      const dataArr = data.split(',');

      // returning resolved promise
      return resolve({
        userCommand: dataArr[0],
        userSearch: dataArr[1],
      });
    });
  });

  const { userCommand, userSearch } = getDataFromTextFile;

  await main(userCommand, userSearch);
  await promptStart();
};

// user chooses if they want to search for a concert, song, movie, or data from txt file
const promptStart = async () => {
  const getCommand = await inquirer.prompt({
    name: 'command',
    type: 'list',
    message: 'What command would you like to use?',
    choices: [
      'concert-this',
      'spotify-this-song',
      'movie-this',
      'do-what-it-says',
      'exit',
    ],
  });

  const { command } = getCommand;

  return command !== 'do-what-it-says' && command !== 'exit'
    ? searchPrompt(command)
    : command === 'do-what-it-says'
    ? randomSearch()
    : null;
};

// user input based on what they're searching for
const searchPrompt = async (promptCommand) => {
  const getSearch = await inquirer.prompt({
    name: 'search',
    type: 'input',
    message: 'What would you like to search for?',
  });

  const { search } = getSearch;

  await main(promptCommand, search);
  await promptStart();
};

// if user types a command, it searches
// else opens prompt
userCommand ? main(userCommand, userSearch) : promptStart();
