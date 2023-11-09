const pool = require("../database");

exports.getAllProperties = (req, res) => {
  pool.query(
    "SELECT properties.*, users.photo AS ownerPhoto FROM properties LEFT JOIN users ON properties.PostedBy = users.id WHERE properties.RentedBy IS NULL",
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json(rows);
    }
  );
};

exports.getPropertiesByUID = (req, res) => {
  const propertyId = req.query.id;

  pool.query(
    "SELECT properties.*, users.photo AS ownerPhoto FROM properties LEFT JOIN users ON properties.PostedBy = users.id WHERE properties.pid = ?",
    [propertyId],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json(rows);
    }
  );
};

exports.getPropertiesByPostedBy = (req, res) => {
  const ownerId = req.query.id;
  pool.query(
    "SELECT properties.*, users.*, reservedusers.* FROM properties LEFT JOIN users ON properties.RentedBy = users.id LEFT JOIN reservedusers ON (properties.RentedBy = reservedusers.submittedBy OR users.id = reservedusers.submittedBy) WHERE properties.PostedBy = ?",
    [ownerId],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json(rows);
    }
  );
};

exports.createTable = async (req, res, next) => {
  try {
    const createTableQuery = `
    CREATE TABLE properties (
    pid INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Description TEXT,
    RentFee DECIMAL(10, 2),
    Features JSON, -- Define as JSON data type
    Images TEXT,
    Location VARCHAR(255),
    PostedBy INT,
    FloorPlanImage TEXT,
    PropertyInfo JSON, -- Define as JSON data type
    Status VARCHAR(20),
    Timestamp TIMESTAMP
    )
  `;

    pool.query(createTableQuery, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json({ message: "Property created", id: result.insertId });
    });
  } catch (exception) {
    console.error("Exception occurred:", exception);
    res.status(500).send(exception);
  }
};

exports.createProperty = async (req, res, next) => {
  console.log("req.body", req.body);
  try {
    const {
      Name,
      Description,
      RentFee,
      Features,
      Images,
      Location,
      PostedBy,
      FloorPlanImage,
      PropertyInfo,
      Status,
    } = req.body;

    pool.query(
      "INSERT INTO properties (Name, Description, RentFee, Features, Images, Location, PostedBy, FloorPlanImage, PropertyInfo, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        Name,
        Description,
        RentFee,
        Features,
        Images,
        Location,
        PostedBy,
        FloorPlanImage,
        JSON.stringify(PropertyInfo),
        Status,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        res.json({ message: "Property created", id: result.insertId });
      }
    );
  } catch (exception) {
    console.error("Exception occurred:", exception);
    res.status(500).send(exception);
  }
};

exports.updateProperty = (req, res) => {
  const propertyId = req.params.id;
  const updateProperty = req.body;
  pool.query(
    "UPDATE properties SET ? WHERE id = ?",
    [updateProperty, propertyId],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json({ message: "Property updated", id: propertyId });
    }
  );
};

exports.propertyReserved = (req, res) => {
  const { phone, checkIn, submittedBy, propertyId } = req.body;

  console.log("body", req.body);

  pool.query(
    "UPDATE properties SET Status = ?, RentedBy = ? WHERE pid = ?",
    ["Reserved", submittedBy, propertyId],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      console.log("property updated");
      res.json({ message: "Property updated", id: propertyId });
    }
  );
  pool.query(
    "INSERT INTO reservedUsers (phone, checkInDate, submittedBy, propertyId) VALUES (?, ?, ?, ?)",
    [phone, checkIn, submittedBy, propertyId],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      console.log("reservedusers updated");
    }
  );
};

exports.deleteProperty = (req, res) => {
  const propertyId = req.params.id;
  pool.query("DELETE FROM properties WHERE id = ?", [propertyId], (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json({ message: "Employee deleted", id: propertyId });
  });
};

module.exports = exports;
