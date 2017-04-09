"use strict";

const express = require('express')
const config = require('./config')

// Create the HTTP server (Express)
const server = express();

// Apply the configuration
config.applyConfiguration(server);

// Export the server
module.exports = server;
