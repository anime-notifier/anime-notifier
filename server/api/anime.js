"use strict";
const nyaa = require('nyaa-available');
const popura = require('popura');

const client = popura(process.env.MAL_USER, process.env.MAL_PASSWORD);

exports.setAnimeList = (data, socket) => {
  client.getAnimeList(data.userName)
  .then(malList => {
    let animeWatching = malList.list.filter((a) => {
      return a.my_status === 1;
    });
    animeWatching = animeWatching.map((a) => {
      return {title: a.series_title, episode: a.my_watched_episodes};
    })
    const promises = [];
    animeWatching.forEach((a, i) => {
      promises.push(new Promise((resolve, reject) => {
        setTimeout(() => {
          nyaa.checkEpisode(a.title, a.episode + 1).then((available) => {
            resolve({title: a.title, available})
          }).catch(err => {reject(err)})
        }, 500 * i);
      }))
    })
    Promise.all(promises).then((response) => {
      socket.emit('anime', {type: 'setAnimeList', animeList: response})
    });
  })
  .catch(err => console.log(err));
}
