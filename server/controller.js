"use strict";

const knex = require('./database').knex;
const bcryptjs = require('bcryptjs');
const Joi = require('joi');

exports.handleRegister = function (req, res) {
  const schema = {
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  };
  Joi.validate(req.body, schema, err => {
    if(err) {
      res.json({status: 'error', error: err.toString()});
      return;
    }

    const { name, email, password } = req.body;
    knex('users').select('*').where({name: name}).then((users) => {
      // If name not exist
      if (users.length === 0) {
        return knex('users').select('*').where({email: email})
      }
      throw new Error('The username you entered have been registered. Please use another username.')
    }).then((users) => {
      // If email not exist
      if (users.length === 0) {
        // Hash the password with random salt 10 round
        return bcryptjs.hash(password, 10);
      }
      throw new Error('The email you entered have been registered. Please use another email.')
    }).then((hashedPassword) => {
      // Save to database
      return knex('users').insert({name, email, password: hashedPassword, salt: bcryptjs.getSalt(hashedPassword), is_active: 1})
    }).then(() => {
      res.json({status: 'success'});
    }).catch((error) => {
      res.json({status: 'error', error: error.toString()});
    });
  })
};

exports.handleLogin = function (req, res) {
  const schema = {
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  };
  Joi.validate(req.body, schema, err => {
    if(err) {
      res.json({status: 'error', error: err.toString()});
      return;
    }

    const { email, password } = req.body;

    let userData = null;
    // Get User Data
    knex('users').select('*').where({email: email}).then((user) => {
      // If user exist
      if (user.length > 0) {
        // Store then user data
        userData = user[0];
        // Hash the inputted password
        return bcryptjs.hash(password, user[0].salt);
      }
      throw new Error('Invalid username or password');
    }).then((hashedPassword) => {
      // If password is correct
      if (userData.password === hashedPassword) {
        req.session.user_id = userData.id;
        res.json({status: 'success'});
        return;
      }
      throw new Error('Invalid username or password');
    }).catch((error) => {
      res.json({status: 'error', error: error.toString()});
    });
  });
};

exports.handleLogout = function (req, res) {
  req.session.destroy(err => {
    if(err) throw err;
    res.json({status: "success"});
  })
};

exports.handleError = function (req, res) {
  res.status(400).send({error: "route not found"});
};
