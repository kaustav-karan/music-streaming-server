const db = require("../config/db");
const fileService = require("../services/fileService");
const audioService = require("../services/audioService");
const logger = require("../utils/logger");
const notifySuperPeer = require("../outBoundReq/notifySuperPeer");
const TrackId = require("../utils/hashTrackID");

exports.uploadSong = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, publisherName, fileName } = req.body;
    if (!title || !publisherName || !fileName) {
      return res.status(400).json({ error: "Title, publisherName, and fileName are required" });
    }

    const fileId = fileName;
    const trackId = TrackId.generateTrackId(title, publisherName);
    console.log("Lund", trackId);

    const opusFiles = await audioService.convertToOpusFormats(
      req.file.path,
      fileId
    );

    const sizes = opusFiles.map(file => file.size);

    const result = await db.query(
      "INSERT INTO songs (id, original_name, storage_name, title, publisherName, sizes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [trackId, req.file.originalname, fileId, title, publisherName, sizes]
    );


    res.status(201).json({
      id: result.rows[0].id,
      message: "File uploaded and processed successfully",
    });

    await notifySuperPeer(fileId, publisherName, sizes[0])
    
  } catch (err) {
    logger.error("Upload error:", err);
    console.log(err)
    res.status(500).json({ error: "File processing failed" });
  }
};

exports.listSongs = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, title, publisherName FROM songs ORDER BY upload_time DESC"
    );
    res.json(result.rows);
  } catch (err) {
    logger.error("Song list error:", err);
    res.status(500).json({ error: "Failed to get song list" });
  }
};
