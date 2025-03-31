const db = require("../config/db");

module.exports = {
  create: async (songId, quality) => {
    await db.query(
      "INSERT INTO streaming_stats (song_id, quality) VALUES ($1, $2)",
      [songId, quality]
    );
  },

  getTopSongs: async () => {
    const result = await db.query(`
      SELECT 
        s.id, 
        s.title, 
        s.artist, 
        COUNT(st.song_id) as play_count
      FROM songs s
      LEFT JOIN streaming_stats st ON s.id = st.song_id
      GROUP BY s.id, s.title, s.artist
      ORDER BY play_count DESC
      LIMIT 10
    `);
    return result.rows;
  },

  getQualityStats: async () => {
    const result = await db.query(`
      SELECT 
        quality, 
        COUNT(*) as count
      FROM streaming_stats
      GROUP BY quality
      ORDER BY quality DESC
    `);
    return result.rows;
  },

  getTotalPlays: async () => {
    const result = await db.query(`
      SELECT COUNT(*) as total_plays FROM streaming_stats
    `);
    return result.rows[0].total_plays || 0;
  },
};
