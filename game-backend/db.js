// db.js
const { Pool } = require('pg');
require('dotenv').config({ path: './../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
