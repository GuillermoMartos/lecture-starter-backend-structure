const knex = require('knex');
const EventEmitter = require('events');
const dbConfig = require('../../knexfile');

const statEmitter = new EventEmitter();
const db = knex(dbConfig.development);

module.exports = { db, statEmitter };
