const pool = require("../database");

exports.getAllProperties = (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (page - 1) * limit;
  const sortOrder = req.query.sortOrder || "asc"; // Default to ascending order

  console.log("page", page);
  console.log("limit", limit);
  console.log("offset", offset);
  console.log("sortOrder", sortOrder);

  const query = `
    SELECT properties.*, users.photo AS ownerPhoto
    FROM properties
    LEFT JOIN users ON properties.PostedBy = users.id
    WHERE properties.RentedBy IS NULL
    ORDER BY RentFee ${sortOrder.toUpperCase()} 
    LIMIT ? OFFSET ?
  `;

  pool.query(query, [parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error", err });
      return;
    }
    console.log("rows", rows);
    res.json(rows);
  });
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

exports.filterProperties = (req, res) => {
  const { thana, district, propertyType, maxRent, minRent, favoriteCount } =
    req.body;
  console.log("req.body", req.body);

  pool.query(
    "SELECT *, JSON_LENGTH(JSON_UNQUOTE(BookmarkedByUsers)) AS bookmarkCount FROM properties WHERE properties.thana = ? AND properties.district = ? AND properties.propertyType = ? AND properties.RentFee BETWEEN ? AND ? AND properties.RentedBy IS NULL GROUP BY properties.pid HAVING bookmarkCount > ?",
    [thana, district, propertyType, minRent, maxRent, favoriteCount],
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      console.log("response", rows);
      if (rows?.length > 0) {
        console.log("rows", rows[0]?.bookmarkCount);
        res.json({
          success: true,
          properties: rows,
        });
      } else {
        res.json({
          success: false,
          properties: [],
          issue: "No property found",
        });
      }
    }
  );
};

exports.getByDistinctThana = (req, res) => {
  pool.query("SELECT DISTINCT thana FROM properties", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.json(rows);
  });
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
      thana,
      district,
      propertyType,
      PostedBy,
      FloorPlanImage,
      PropertyInfo,
      Status,
    } = req.body;

    pool.query(
      "INSERT INTO properties (Name, Description, RentFee, Features, Images, Location,thana,district, propertyType, PostedBy, FloorPlanImage, PropertyInfo, Status) VALUES (?, ?, ?, ?, ?, ?,?,?,?, ?, ?, ?, ?)",
      [
        Name,
        Description,
        RentFee,
        Features,
        Images,
        Location,
        thana,
        district,
        propertyType,
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

exports.bookmarkProperty = (req, res) => {
  const propertyId = req.body.id;
  const { userId } = req.body;

  // Ensure that at least one field is provided to update
  if (!userId) {
    return res.status(400).json({ error: "No fields provided for update" });
  }

  pool.query(
    "SELECT bookmarkedByUsers FROM properties WHERE pid = ?",
    [propertyId],
    (selectErr, selectResult) => {
      if (selectErr) {
        console.error(selectErr);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      console.log("selectResult", selectResult);
      let bookmarkedByUsers = [];
      if (selectResult.length > 0) {
        const existingBookmarked = selectResult[0].bookmarkedByUsers;
        console.log("existingBookmarked", existingBookmarked);
        bookmarkedByUsers = existingBookmarked
          ? JSON.parse(existingBookmarked)
          : [];
        console.log("bookmarkedByUsers", bookmarkedByUsers);
      }

      if (bookmarkedByUsers.includes(userId)) {
        bookmarkedByUsers = bookmarkedByUsers.filter((item) => item !== userId);
      } else {
        bookmarkedByUsers.push(userId);
      }

      console.log("bookmarkedByUsers", bookmarkedByUsers);

      // Construct the update fields dynamically based on provided values
      const updateFields = {
        bookmarkedByUsers: JSON.stringify(bookmarkedByUsers),
      };

      console.log("updateFields", updateFields);

      pool.query(
        "UPDATE properties SET ? WHERE pid = ?",
        [updateFields, propertyId],
        (updateErr) => {
          if (updateErr) {
            console.error(updateErr);
            res.status(500).json({ error: "Internal server error" });
            return;
          }
          res.json({ message: "Property updated", id: propertyId });
        }
      );
    }
  );
};

exports.updateProperty = (req, res) => {
  const propertyId = req.body.id;
  const {
    Description,
    RentFee,
    Location,
    thana,
    district,
    propertyType,
    PropertyInfo,
  } = req.body;

  // Ensure that at least one field is provided to update
  if (
    !Description &&
    !RentFee &&
    !Location &&
    !PropertyInfo &&
    !thana &&
    !district &&
    !propertyType
  ) {
    return res.status(400).json({ error: "No fields provided for update" });
  }

  // Construct the update fields dynamically based on provided values
  const updateFields = {};
  if (Description) updateFields.Description = Description;
  if (RentFee) updateFields.RentFee = RentFee;
  if (Location) updateFields.Location = Location;
  if (PropertyInfo) updateFields.PropertyInfo = JSON.stringify(PropertyInfo);
  if (thana) updateFields.thana = thana;
  if (district) updateFields.district = district;
  if (propertyType) updateFields.propertyType = propertyType;

  pool.query(
    "UPDATE properties SET ? WHERE pid = ?",
    [updateFields, propertyId],
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
  const propertyId = req.body.id;
  pool.query("DELETE FROM properties WHERE pid = ?", [propertyId], (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json({ message: "Employee deleted", id: propertyId });
  });
};

module.exports = exports;
