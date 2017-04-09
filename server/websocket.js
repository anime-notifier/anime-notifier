"use strict";

const anime = require('./api/anime');

// Set up routes here instead of messing with code
const routes =
[
  {
    on: 'anime',
    routes: [
      {type: 'getList', func: anime.setAnimeList}
    ]
  }
]

// Map routes to better format to be accessed
const mapRoute = () => {
  routes.forEach((val) => {
    // For every socket
    const map = val.routes.reduce((a, b) => {
      // Map to 2 different vars
      a.types.push(b.type);
      a.functions.push(b.func);
      return a;
    }, {types: [], functions: []});
    // Put back in routes
    val.types = map.types;
    val.functions = map.functions;
  })
}

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
    mapRoute();
    routes.forEach((val) => {
      socket.on(val.on, (data) => {
        const index = val.types.indexOf(data.type);
        if(index !== -1){
          val.functions[index](data, socket);
        }
      })
    })
  });
  return server;
};
