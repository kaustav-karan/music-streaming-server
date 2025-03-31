const { Pool } = require("pg");
const logger = require("./utils/logger");

const adminPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

(async () => {
  let client;
  try {
    // Create database
    await adminPool.query("CREATE DATABASE music_stream");
    logger.info("Database created");

    // Connect to new database
    client = await adminPool.connect();

    // Create tables
    await client.query(`
      CREATE TABLE songs (
        id SERIAL PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        storage_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        upload_time TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE streaming_stats (
        id SERIAL PRIMARY KEY,
        song_id INTEGER REFERENCES songs(id) NOT NULL,
        quality VARCHAR(10) NOT NULL,
        stream_time TIMESTAMP DEFAULT NOW()
      )
    `);

    logger.info("Tables created successfully");
  } catch (err) {
    logger.error("Database initialization failed:", err);
  } finally {
    if (client) client.release();
    adminPool.end();
    process.exit();
  }
})();
