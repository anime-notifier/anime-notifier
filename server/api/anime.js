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

    const finishedAnime = mal.list.filter(val => val.series_status === 2).map((val) => {
      return {title: val.series_title, available: true};
    })
    socket.emit('anime', {type: 'setAnimeListBulk', animeListBulk: finishedAnime});

    const notAiringAnime = mal.list.filter(val => val.series_status === 3).map((val) => {
      return {title: val.series_title, available: false};
    })
    socket.emit('anime', {type: 'setAnimeListBulk', animeListBulk: notAiringAnime});

    const airingAnimeTitles = mal.list.filter(val => val.series_status === 1).map((val) => {
      return val.series_title;
    })
    knex('animes').select('*').whereIn('name', airingAnimeTitles).then((model) => {
      const airingAnime = model.map((val) => {
        // Maybe a faster way to do this?
        const watchedEpisodeCount = mal.list.filter(a => a.series_title === val.name)[0].my_watched_episodes;
        const nextEpisode = addDays(new Date(val.air_date), val.update_frequency * watchedEpisodeCount);
        if(isFuture(nextEpisode)){
          return {title: val.name, available: false};
        }
        return {title: val.name, available: true};
      })
      socket.emit('anime', {type: 'setAnimeListBulk', animeListBulk: airingAnime});
      // socket.emit('anime', {type: 'setAnimeList', animeList: {title: val.name, available: "error"}});
    })
  })
  .catch(err => console.log(err));
}
