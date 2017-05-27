const popura = require('popura');
const client = popura(process.env.MAL_USER, process.env.MAL_PASSWORD);

exports.processData = (userName) => {
  return new Promise((resolve, reject) => {
    client.getAnimeList(userName).then((mal) => {
      const list = mal.list.map((val) => {
        return {title: val.series_title, image: val.series_image, episodes: val.series_episodes, status: val.series_status, watchCount: val.my_watched_episodes, watchStatus: val.my_status}
      })
      resolve(list);
    }).catch(err => {
      if(err.toString() === "Error: No 'myinfo' field in list data therefore, it's an invalid list"){
        reject('invalid_username');
      }else{
        reject(err);
      }
    });
  })
}
