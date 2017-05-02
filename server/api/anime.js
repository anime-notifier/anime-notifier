"use strict";
const popura = require('popura');
const knex = require('../database').knex;

const addDays = require('date-fns/add_days');
const isFuture = require('date-fns/is_future')

const client = popura(process.env.MAL_USER, process.env.MAL_PASSWORD);

exports.setAnimeList = (data, socket) => {
  // Get anime list from MAL with username
  client.getAnimeList(data.userName)
  .then(malList => {
    // Filter watching anime
    let animeWatching = malList.list.filter((a) => {
      return a.my_status === 1;
    });
    // Send anime list
    socket.emit('anime', {type: 'malAnimeList', malAnimeList: animeWatching})
    // Map for ease of use
    animeWatching = animeWatching.map((a) => {
      return {title: a.series_title, episode: a.my_watched_episodes, series_status: a.series_status};
    })
    // Check the availability for each anime
    for(let i=0; i<animeWatching.length; i++){
      // If anime has finished airing
      if(animeWatching[i].series_status === 2){
        // Set as available
        socket.emit('anime', {type: 'setAnimeList', animeList: {title: animeWatching[i].title, available: true}});
        continue;
      }
      // TODO: Send when the anime will air
      // Else check database
      knex('animes').select('*').where({name: animeWatching[i].title}).then((model) => {
        if(model.length !== 0){
          // If anime schedule is changed
          if(model[0].next_episode && model[0].next_air){
            // If the next episode is lower than what is going to be out
            if(animeWatching[i].episode + 1 < model[0].next_episode){
              // Then it is available
              socket.emit('anime', {type: 'setAnimeList', animeList: {title: animeWatching[i].title, available: true}});
            }else{ // Next episode is higher than that, calculate it
              const nextEpisode = addDays(new Date(model[0].next_air), model[0].update_frequency * (animeWatching[i].episode + 1 - model[0].next_episode))
              // If next episode is in the future
              if(isFuture(nextEpisode)){
                // Then it is not available
                socket.emit('anime', {type: 'setAnimeList', animeList: {title: animeWatching[i].title, available: false}});
              }else{
                // If in the past, then it is available
                socket.emit('anime', {type: 'setAnimeList', animeList: {title: animeWatching[i].title, available: true}});
              }
            }
            return;
          }

          // No schedule change
          const nextEpisode = addDays(new Date(model[0].air_date), model[0].update_frequency * animeWatching[i].episode);
          // If next episode is in the future
          if(isFuture(nextEpisode)){
            // Then it is not available
            socket.emit('anime', {type: 'setAnimeList', animeList: {title: animeWatching[i].title, available: false}});
          }else{
            // If in the past, then it is available
            socket.emit('anime', {type: 'setAnimeList', animeList: {title: animeWatching[i].title, available: true}});
          }
        }else{
          // Data not found in the database
          socket.emit('anime', {type: 'setAnimeList', animeList: {title: animeWatching[i].title, available: "error"}});
        }
      })
    }
  })
  .catch(err => console.log(err));
}
