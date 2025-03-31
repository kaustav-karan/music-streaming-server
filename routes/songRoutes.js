const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const songController = require("../controllers/songController");

router.post("/upload", upload.single("song"), songController.uploadSong);
router.get("/", songController.listSongs);

module.exports = router;
