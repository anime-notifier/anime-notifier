"use strict";

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
    // Debug
    socket.on('message', function (data) {
        console.log('Message: ' + data);
    });
    console.log('A user connected with id = ' + socket.id);
  });
  return server;
};
