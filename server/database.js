"use strict";

const DBInfo = {
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE,
  // Indicate the time is stored in UTC
  timezone : "Z",
  charset  : 'utf8'
}
exports.DBInfo = DBInfo;

// Database infos
const knexSetting = {
  client: 'mysql',
  connection: DBInfo
}
exports.knexSetting = knexSetting;

// Knex
const knex = require('knex')(knexSetting);
exports.knex = knex;
