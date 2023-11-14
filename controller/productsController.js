const pool = require("../database");

exports.getProducts = (req, res) => {
  pool.query("SELECT * FROM products", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    console.log("products", rows);
    res.json(rows);
  });
};

exports.searchProducts = (req, res) => {
  const { searchKey } = req.body;
  console.log("searchKey", searchKey);

  pool.query(
    "SELECT * FROM products WHERE name LIKE ?",
    ["%" + searchKey + "%"],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      console.log("products", rows);
      res.json(rows);
    }
  );
};
