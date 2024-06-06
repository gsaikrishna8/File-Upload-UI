const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const user = require("../models/user");

const DIR = "./store/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = uuidv4() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });
router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const url = req.protocol + "://" + req.get("host");
    const data = req.files.map((file) => {
      // const fileType = file.mimetype.replace("application/", "");
      const fileType = file.mimetype.split("/")[1];
      return {
        file: {
          fileType: fileType,
          filePath: url + "/" + file.originalname,
          fileName: file.originalname,
        },
      };
    });
    console.log("data", data);
    const files = await user.create(data);
    res.status(200).send(files);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/getuploadlist", async (req, res) => {
  try {
    const data = await user.find().lean();
    // console.log("data", data);
    res.status(200).json({ users: data });
  } catch (error) {
    console.error("Get Upload List Error:", error);
    res.status(500).json({ message: error.message });
  }
});
router.post("/file/:id", async (req, res) => {
  try {
    const fileId = req.params.id;
    const fileRecord = await user.findById(fileId);

    if (!fileRecord || !fileRecord.file) {
      return res.status(404).json({ message: "File not found" });
    }

    const { fileType, fileName, fileData } = fileRecord.file;

    // Set headers to indicate the content type and disposition
    res.set("Content-Type", fileType);
    res.set("Content-Disposition", `inline; filename="${fileName}"`);

    // Send the file data
    res.send(fileData);
  } catch (error) {
    console.error("Get File Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/deletefile", async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { _id } = req.body;

    if (!_id) {
      console.error("File ID is required");
      return res.status(400).json({ message: "File ID is required" });
    }
    _id.map(async (id, index) => {
      const deletefile = await user.findByIdAndDelete(id);
      if (!deletefile) {
        console.error("File not found in database");
        return res.status(404).json({ message: "File not found" });
      }

      console.log("Deleted File:", deletefile);
    });

    const users = await user.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Delete File Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
