const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "../uploads");
const OPUS_DIR = path.join(__dirname, "../opus");

// Ensure directories exist
[UPLOADS_DIR, OPUS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

module.exports = {
  getUploadsDir: () => UPLOADS_DIR,
  getOpusDir: () => OPUS_DIR,

  generateUniqueFileName: (originalName) => {
    return `${Date.now()}-${originalName}`;
  },

  generateFileId: (fileName) => {
    return path.parse(fileName).name;
  },

  getOpusFilePath: (fileId, quality) => {
    return path.join(OPUS_DIR, `${fileId}-${quality}.opus`);
  },

  fileExists: (filePath) => {
    return fs.existsSync(filePath);
  },

  streamFile: (filePath, req, res) => {
    return new Promise((resolve) => {
      try {
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunkSize = end - start + 1;
          const file = fs.createReadStream(filePath, { start, end });

          res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "audio/ogg",
          });

          file.pipe(res);
          file.on("end", () => resolve({ success: true, response: res }));
          file.on("error", () => resolve({ success: false }));
        } else {
          res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "audio/ogg",
          });

          const file = fs.createReadStream(filePath);
          file.pipe(res);
          file.on("end", () => resolve({ success: true, response: res }));
          file.on("error", () => resolve({ success: false }));
        }
      } catch (err) {
        resolve({ success: false });
      }
    });
  },
};
