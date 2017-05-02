"use strict";
// const nyaa = require('nyaa-available');
const popura = require('popura');

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
      // Temporary replacement for nyaa.se
      socket.emit('anime', {type: 'setAnimeList', animeList: {title: animeWatching[i].title, available: "error"}});
      // // Set delay to not flood nyaa.se
      // setTimeout(() => {
      //   // Check for the next episode from last watched
      //   nyaa.checkEpisode(a.title, a.episode + 1).then((available) => {
      //     // Send data
      //     socket.emit('anime', {type: 'setAnimeList', animeList: {title: a.title, available}})
      //   }).catch(err => {console.log(err)})
      // }, 500 * i);
    }
  })
  .catch(err => console.log(err));
}
