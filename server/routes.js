"use strict";

// Will be used to handle logins

// Routes
module.exports = function (app, controller) {

  // Everything else
  app.use('*', controller.handleError);
};
