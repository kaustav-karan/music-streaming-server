const express = require("express");
const router = express.Router();
const streamController = require("../controllers/streamController");

router.get("/:id/:quality", streamController.streamSong);

module.exports = router;
