const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const propertyRouter = require("./routes/properties");
const userRoutes = require("./routes/users");
const shiftingRoutes = require("./routes/shiftings");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.use("/properties", propertyRouter);
app.use("/users", userRoutes);
app.use("/shiftings", shiftingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
