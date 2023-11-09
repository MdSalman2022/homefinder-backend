const pool = require("../database");

exports.getAllProperties = (req, res) => {
  pool.query("SELECT * FROM shiftings", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json(rows);
  });
};

function createShiftingsTable(callback) {
  // Query to check if the "shiftings" table already exists
  const checkTableQuery = "SHOW TABLES LIKE 'shiftings'";

  pool.query(checkTableQuery, (err, result) => {
    if (err) {
      console.error(err);
      callback(err);
      return;
    }

    // If the table doesn't exist, create it
    if (result.length === 0) {
      const createTableQuery = `
          CREATE TABLE shiftings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            phone VARCHAR(255),
            email VARCHAR(255),
            dayOfShifting VARCHAR(255),
            from_location VARCHAR(255),
            to_location VARCHAR(255),
            submittedBy VARCHAR(255),
            Timestamp TIMESTAMP
          )
        `;

      pool.query(createTableQuery, (err, createResult) => {
        if (err) {
          console.error(err);
          callback(err);
          return;
        }
        console.log("Shiftings table created");
        callback(null);
      });
    } else {
      // The table already exists
      callback(null);
    }
  });
}

exports.createShifting = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      dayOfShifting,
      from_location,
      to_location,
      submittedBy,
    } = req.body;

    createShiftingsTable((err) => {
      if (err) {
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      // Insert the data into the "shiftings" table
      const insertDataQuery = `
          INSERT INTO shiftings (name, phone, email, dayOfShifting, from_location, to_location, submittedBy) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

      pool.query(
        insertDataQuery,
        [
          name,
          phone,
          email,
          dayOfShifting,
          from_location,
          to_location,
          submittedBy,
        ],
        (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
            return;
          }
          res.json({ message: "Shifting created", id: result.insertId });
        }
      );
    });
  } catch (exception) {
    console.error("Exception occurred:", exception);
    res.status(500).send(exception);
  }
};
