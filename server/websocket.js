"use strict";

const anime = require('./api/anime');

module.exports = (app) => {
  // Set up server
  const server = require("http").createServer(app);
  const io = require('socket.io').listen(server);
  const ios = require('socket.io-express-session');

  // Sessions
  const sessionConfig = require("./session").sessionConfig;
  io.use(ios(sessionConfig));

  // Websocket API
  io.on('connection', function(socket){
    socket.on('anime', function (data) {
      switch(data.type){
        case 'getList':
          anime.setAnimeList(socket);
          break;
        default:
          break;
      }
    });
  });
  return server;
};
