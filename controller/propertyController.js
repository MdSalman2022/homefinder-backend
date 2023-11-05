// const { supabase } = require("../app");
const pool = require("../database");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://zsarqmlqnksuwzwmupwh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYXJxbWxxbmtzdXd6d211cHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkxODU2NjksImV4cCI6MjAxNDc2MTY2OX0.eJMUBZS8FA1_SnGAKFcLZmRO2d3xN84EMis-eWUvReA"
);

exports.getAllProperties = (req, res) => {
  pool.query("SELECT * FROM properties", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json(rows);
  });
};

exports.getPropertiesByPostedBy = (req, res) => {
  const propertyId = req.query.id;
  pool.query(
    "SELECT * FROM properties WHERE PostedBy = ?",
    [propertyId],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json(rows); // Return the array of matching properties
    }
  );
};

exports.createTable = async (req, res, next) => {
  try {
    const createTableQuery = `
    CREATE TABLE properties (
    UID INT AUTO_INCREMENT PRIMARY KEY,
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
