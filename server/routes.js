"use strict";

// Routes
module.exports = function (app, controller) {
  // Auth
  app.post('api/login', controller.handleLogin);
  app.post('api/register', controller.handleRegister);
  app.use('api/logout', controller.handleLogout);

  // Everything else
  app.use('*', controller.handleError);
};
