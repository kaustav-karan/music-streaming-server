const db = require("../config/db");

module.exports = {
  create: async (originalName, storageName, title, artist) => {
    const result = await db.query(
      "INSERT INTO songs (original_name, storage_name, title, artist) VALUES ($1, $2, $3, $4) RETURNING id",
      [originalName, storageName, title, artist]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await db.query(
      "SELECT id, title, artist FROM songs ORDER BY upload_time DESC"
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(
      "SELECT storage_name FROM songs WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },
};
