const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const main = require("./app");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.post("/", (req, res) => {
  res.send("hi");
  console.log("HI");
});
app.use("*", cors());
app.use("/api", main);
app.listen(4000, () => console.log("Running on port 4000"));
