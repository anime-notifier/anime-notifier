const nani = require('nani').init("vija02-nctk6", "2yYHzaS09NkXuU7gS9UhZ1E");

const animeStatusMap = {"currently airing": 1, "finished airing": 2, "not yet aired": 3, "cancelled": 4};
const listStatusMap = {"watching": 1, "completed": 2, "on-hold": 3, "dropped": 4, "plan to watch": 6};

exports.processData = (userName) => {
  return new Promise((resolve, reject) => {
    nani.get(`user/${userName}/animelist`).then((alist) => {
      const combinedList = alist.lists.completed
      .concat(alist.lists.plan_to_watch)
      .concat(alist.lists.dropped)
      .concat(alist.lists.on_hold)
      .concat(alist.lists.watching)
      const list = combinedList.map((val) => {
        const animeStatus = animeStatusMap[val.anime.airing_status];
        const listStatus = listStatusMap[val.list_status];
        return {title: val.anime.title_english, image: val.anime.image_url_lge, episodes: val.anime.total_episodes, status: animeStatus, watchCount: val.episodes_watched, watchStatus: listStatus}
      })
      resolve(list);
    }).catch(err => {
      if(err.toString() === "Error: Bad query"){
        reject('invalid_username');
      }else{
        reject(err);
      }
    });
  })
}
