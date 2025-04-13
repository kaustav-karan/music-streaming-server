const { Pool } = require("pg");
const logger = require("./utils/logger");

const adminPool = new Pool({
  user: "cebasture",
  host: "localhost",
  database: "music_streaming",
  password: "psql#1120",
  port: 5432,
});

(async () => {
  let client;
  try {
    // Create database
    // await adminPool.query("CREATE DATABASE music_stream");
    // logger.info("Database created");

    // Connect to new database
    client = await adminPool.connect();

    // Create tables
    await client.query(`
      CREATE TABLE songs (
        id CHAR(7) PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        storage_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        publisherName VARCHAR(255) NOT NULL,
        size BIGINT[] NOT NULL,
        upload_time TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE streaming_stats (
        id CHAR(7) PRIMARY KEY,
        song_id CHAR(7) REFERENCES songs(id),
        quality VARCHAR(10) NOT NULL,
        stream_time TIMESTAMP DEFAULT NOW()
      )
    `);

    logger.info("Tables created successfully");
  } catch (err) {
    logger.error("Database initialization failed:", err);
    console.log(err);
  } finally {
    if (client) client.release();
    adminPool.end();
    process.exit();
  }
})();
