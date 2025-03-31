const db = require("../config/db");
const fileService = require("../services/fileService");
const audioService = require("../services/audioService");
const logger = require("../utils/logger");

exports.uploadSong = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, artist } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: "Title and artist are required" });
    }

    const fileId = fileService.generateFileId(req.file.filename);
    const opusFiles = await audioService.convertToOpusFormats(
      req.file.path,
      fileId
    );

    const result = await db.query(
      "INSERT INTO songs (original_name, storage_name, title, artist) VALUES ($1, $2, $3, $4) RETURNING id",
      [req.file.originalname, fileId, title, artist]
    );

    res.status(201).json({
      id: result.rows[0].id,
      message: "File uploaded and processed successfully",
    });
  } catch (err) {
    logger.error("Upload error:", err);
    res.status(500).json({ error: "File processing failed" });
  }
};

exports.listSongs = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, title, artist FROM songs ORDER BY upload_time DESC"
    );
    res.json(result.rows);
  } catch (err) {
    logger.error("Song list error:", err);
    res.status(500).json({ error: "Failed to get song list" });
  }
};
