require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { s3Uploadv2 } = require("./s3Service");
const uuid = require("uuid").v4;

const app = express();

// Disk storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const { originalname } = file;
//     cb(null, `${uuid()}-${originalname}`);
//   },
// });

// Memory storage
const storage = multer.memoryStorage();

// Filter only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000, files: 2 },
}); // 1 Mb file size and only accept 2 files
const multiUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

// single file upload
// app.post("/upload", upload.single("file"), (req, res) => {
//   try {
//     res.json({ status: "File uploaded" });
//   } catch (error) {
//     console.log(error);
//   }
// });

// multiple file uploads
// app.post("/upload", upload.array("file", 3 ), (req, res) => {
//   try {
//     res.json({ status: "File uploaded" });
//   } catch (error) {
//     console.log(error);
//   }
// });

// multiple fields uploads
// app.post("/upload", multiUpload, (req, res) => {
//   try {
//     console.log(req.files);
//     res.json({ status: "File uploaded" });
//   } catch (error) {
//     console.log(error);
//   }
// });

app.post("/upload", upload.array("file"), async (req, res) => {
  try {
    const file = req.files[0];
    const result = await s3Uploadv2(file);
    res.status(200).json({ status: "File uploaded", result });
  } catch (error) {
    console.log(error);
  }
});

// errors handling for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "File limit exceeded",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "File is only an image",
      });
    }
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));
