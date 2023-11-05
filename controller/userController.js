const pool = require("../database");

exports.getAllUsers = (req, res) => {
  pool.query("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json(rows);
  });
};

exports.getUserById = (req, res) => {
  const uid = req.query.uid;
  console.log("uid", uid);
  pool.query("SELECT * FROM users WHERE uid = ?", [uid], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json({ user: rows, success: true });
  });
};

exports.createUser = async (req, res, next) => {
  console.log("req.body", req.body);
  try {
    const { name, email, uid, photoURL } = req.body;

    const photo = photoURL;
    const timestamp = Date.now();

    pool.query(
      "INSERT INTO users (name, email, uid, photo, timestamp) VALUES (?, ?, ?, ?, ?)",
      [name, email, uid, photo, timestamp],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        res.json({ message: "User created", id: result.insertId });
      }
    );
  } catch (exception) {
    console.error("Exception occurred:", exception);
    res.status(500).send(exception);
  }
};
