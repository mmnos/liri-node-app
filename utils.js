const moment = require('moment');

const displayVenueData = async (band) => {
  const { venue, datetime } = band;

  return console.log(`
    Venue : ${venue.name}
    Location : ${venue.city}
    Date : ${moment(datetime).format('MM/DD/YYYY')}
  `);
};

const displayMusicData = async (song) => {
  const { artists, name, external_urls, album } = song;

  return console.log(`
    Artist : ${artists[0].name}
    Song : ${name}
    Link : ${external_urls.spotify}
    Album : ${album.name}
  `);
};

const displayMovieData = async (movie) => {
  const { data } = movie;

  return console.log(`
    Title : ${data.Title}
    Release Year : ${data.Year}
    IMDB Rating : ${data.Rated}
    Rotten Tomatoes Rating : ${data.Ratings[1].Value}
    Country : ${data.Country}
    Language : ${data.Language}
    Plot : ${data.Plot}
    Actors : ${data.Actors}
  `);
};

module.exports = {
  displayVenueData,
  displayMusicData,
  displayMovieData,
};
