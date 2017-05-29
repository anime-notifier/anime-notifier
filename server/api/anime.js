"use strict";
const knex = require('../database').knex;

const addDays = require('date-fns/add_days');
const isFuture = require('date-fns/is_future')

const mal = require('./provider/mal');
const alist = require('./provider/alist');

exports.setAnimeList = (data, socket) => {
  let processData;
  switch(data.provider){
    case "mal":
      processData = mal.processData;
      break;
    case "alist":
      processData = alist.processData;
      break;
    default:
      return;
  }

  processData(data.userName).then((list) => {
    // Send anime list
    socket.emit('anime', {type: 'animeList', animeList: list})

    const airingAnimes = list.filter(val => val.status === 1)
    const airingAnimeTitles = airingAnimes.map((val) => {
      return val.title;
    })

    knex('titles').select('animes.*', "titles.name").join("animes", "titles.anime_id", "=", "animes.id")
    .whereIn('titles.name', airingAnimeTitles).then((model) => {
      // For all anime in the database, check if available or not
      const airingAnime = model.map((val) => {
        const watchedEpisodeCount = airingAnimes.filter(a => a.title === val.name)[0].watchCount;
        const nextEpisode = addDays(new Date(val.air_date), val.update_frequency * watchedEpisodeCount);
        if(isFuture(nextEpisode)){
          return {title: val.name, available: false};
        }
        return {title: val.name, available: true};
      })
      socket.emit('anime', {type: 'setAnimeStatusBulk', animeStatusBulk: airingAnime});

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
      socket.emit('anime', {type: 'setAnimeStatusBulk', animeStatusBulk: unknownAnime});
    })
  }).catch((err) => {
    if(err === "invalid_username"){
      socket.emit('anime', {type: 'animeList', animeList: "invalid_username"})
    }else{
      console.log(err);
    }
  })
}
