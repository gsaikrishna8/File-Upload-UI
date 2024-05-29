const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const router = express.Router();
const { MongoClient } = require("mongodb");
const dbConfig = require("./database/db");
const uri = dbConfig.db;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected to Database");
  })
  .catch((error) => {
    console.log(error);
  });

// router.use("/store", express.static("store"));
router.use("/routes", require("./routes/routes"));
module.exports = router;
