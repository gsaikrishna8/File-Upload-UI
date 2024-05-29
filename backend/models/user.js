const mongoose = require("mongoose");
const databaseSchema = mongoose.Schema(
  {
    file: {
      fileType: {
        type: String,
        required: true,
      },
      filePath: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);
const database = mongoose.model("file", databaseSchema);
module.exports = database;
