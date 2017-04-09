"use strict";

// Parser
const bodyParser = require("body-parser");

// Sessions
const sessionConfig = require("./session").sessionConfig;

// Basic Config tested for express 4.x
const applyConfiguration = function (server) {
	const app = server;

	// Parse the body
	app.use(bodyParser.urlencoded({ extended: false }));

	// Parse application/json
	app.use(bodyParser.json());

  // Handle sessions
  app.use(sessionConfig);

	// Enable CORS https://enable-cors.org/server_expressjs.html
	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.header("Access-Control-Allow-Credentials", "true");
	  next();
	});
}

exports.applyConfiguration = applyConfiguration;
