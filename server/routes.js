"use strict";
const anime = require('./api/anime');

// Routes
module.exports = function (app, controller) {
  app.get('/api/getAnimeList', anime.getAnimeList);

  // Everything else
  app.use('*', controller.handleError);
};
