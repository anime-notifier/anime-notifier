"use strict";

// Sessions config
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session);
const knex = require('./database').knex;

const store = new KnexSessionStore({
  knex: knex,
	createtable: true,
	clearInterval: 3600000 // 1 Hour
});

exports.sessionConfig = session({
	key: 'login',
  secret: '@$dja$n6kjn412aFa',
  resave : true,
  saveUninitialized : true,
  cookie: {
      maxAge: 3600000  // 1 Hour
  },
  store: store
})
