const db = require("../config/db");
const logger = require("../utils/logger");

exports.getAnalytics = async (req, res) => {
  try {
    const topSongs = await db.query(`
      SELECT 
        s.id, 
        s.title, 
        s.publisherName, 
        COUNT(st.song_id) as play_count
      FROM songs s
      LEFT JOIN streaming_stats st ON s.id = st.song_id
      GROUP BY s.id, s.title, s.publisherName
      ORDER BY play_count DESC
      LIMIT 10
    `);

    const qualityStats = await db.query(`
      SELECT 
        quality, 
        COUNT(*) as count
      FROM streaming_stats
      GROUP BY quality
      ORDER BY quality DESC
    `);

    const totalPlays = await db.query(`
      SELECT COUNT(*) as total_plays FROM streaming_stats
    `);

    res.json({
      topSongs: topSongs.rows,
      qualityDistribution: qualityStats.rows,
      totalPlays: totalPlays.rows[0].total_plays || 0,
    });
  } catch (err) {
    logger.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to get analytics" });
  }
};
