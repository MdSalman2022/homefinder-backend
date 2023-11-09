const mysql = require("mysql");
require("dotenv").config();

// for localhost
/* const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: "root",
  password: "",
  database: "property",
}); */

// for production
const pool = mysql.createConnection({
  host: "salman-mysql.mysql.database.azure.com",
  user: "salman",
  password: "Vul@@rK0rbon@",
  database: "property",
  connectionLimit: 10,
});

module.exports = pool;
