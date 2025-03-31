const db = require("../config/db");
const fileService = require("../services/fileService");
const logger = require("../utils/logger");
const constants = require("../utils/constants");

exports.streamSong = async (req, res) => {
  let filePath;
  try {
    const { id, quality } = req.params;

    if (!constants.ALLOWED_QUALITIES.includes(quality)) {
      return res.status(400).json({ error: "Invalid quality setting" });
    }

    // Get song info first
    const songResult = await db.query(
      "SELECT storage_name FROM songs WHERE id = $1",
      [id]
    );

    if (songResult.rows.length === 0) {
      return res.status(404).json({ error: "Song not found" });
    }

    filePath = fileService.getOpusFilePath(
      songResult.rows[0].storage_name,
      quality
    );

    if (!fileService.fileExists(filePath)) {
      return res.status(404).json({ error: "Audio file not found" });
    }

    // Stream the file first
    const streamResult = await fileService.streamFile(filePath, req, res);

    // Only log the play if streaming was successful
    if (streamResult.success) {
      await db.query(
        "INSERT INTO streaming_stats (song_id, quality) VALUES ($1, $2)",
        [id, quality]
      );
    }

    return streamResult.response;
  } catch (err) {
    logger.error("Stream error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Streaming failed" });
    }
  }
};
