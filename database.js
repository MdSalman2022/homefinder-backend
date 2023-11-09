const mysql = require("mysql");
require("dotenv").config();

// for localhost
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: "root",
  password: "",
  database: "property",
});

// for production
/* const pool = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "property",
  connectionLimit: 10,
}); */

module.exports = pool;
