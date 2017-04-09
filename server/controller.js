"use strict";

exports.handleError = function (req, res) {
  res.status(400).send({error: "route not found"});
};
