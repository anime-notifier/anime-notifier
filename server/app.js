"use strict";

// Load Env File
require('dotenv').config();

let server = require('./server');
const controller = require('./controller');
const websocket = require('./websocket');
const port = (process.env.PORT || 3000);

// Setup routes
require('./routes')(server, controller);

// Setup websocket
server = websocket(server);

// Start server
server.listen(port);
console.log(`Backend Listening at http://localhost:${port}`);
