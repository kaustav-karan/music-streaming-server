const multer = require("multer");
const path = require("path");
const fileService = require("../services/fileService");
const logger = require("../utils/logger");
const { MAX_FILE_SIZE } = require("../utils/constants");

const storage = multer.diskStorage({
  destination: fileService.getUploadsDir(),
  filename: (req, file, cb) => {
    const uniqueName = fileService.generateUniqueFileName(file.originalname);
    req.body = {
      ...req.body,
      fileName: uniqueName,
    };
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["audio/mpeg", "audio/mp3"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Attempted upload of invalid file type: ${file.mimetype}`);
    cb(new Error("Only MP3 files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }, // 20MB limit
});

module.exports = upload;
