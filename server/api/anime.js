"use strict";
const popura = require('popura');
const knex = require('../database').knex;

const addDays = require('date-fns/add_days');
const isFuture = require('date-fns/is_future')

const client = popura(process.env.MAL_USER, process.env.MAL_PASSWORD);

exports.setAnimeList = (data, socket) => {
  // Get anime list from MAL with username
  client.getAnimeList(data.userName)
  .then(mal => {
    // Send anime list
    socket.emit('anime', {type: 'malAnimeList', malAnimeList: mal.list})

    const airingAnimes = mal.list.filter(val => val.series_status === 1)
    const airingAnimeTitles = airingAnimes.map((val) => {
      return val.series_title;
    })
    knex('animes').select('*').whereIn('name', airingAnimeTitles).then((model) => {
      // For all anime in the database, check if available or not
      const airingAnime = model.map((val) => {
        const watchedEpisodeCount = airingAnimes.filter(a => a.series_title === val.name)[0].my_watched_episodes;
        const nextEpisode = addDays(new Date(val.air_date), val.update_frequency * watchedEpisodeCount);
        if(isFuture(nextEpisode)){
          return {title: val.name, available: false};
        }
        return {title: val.name, available: true};
      })
      socket.emit('anime', {type: 'setAnimeListBulk', animeListBulk: airingAnime});

      // Detect anime that is not in the database
      let unknownAnime = model.reduce((a, cur) => {
        // Remove all anime that is found by database
        const acc = a;
        const index = acc.indexOf(cur.name);
        if(index > -1){
          acc.splice(index, 1);
          return acc;
        }
        return acc
      }, airingAnimeTitles)
      unknownAnime = unknownAnime.map((animeTitle) => {
        return {title: animeTitle, available: "unknown"}
      })
      socket.emit('anime', {type: 'setAnimeListBulk', animeListBulk: unknownAnime});
    })
  }).catch(err => {
    if(err.toString() === "Error: No 'myinfo' field in list data therefore, it's an invalid list"){
      socket.emit('anime', {type: 'malAnimeList', malAnimeList: "invalid_username"})
    }else{
      console.log(err);
    }
  });
}
