const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const UPLOADS_DIR = path.join(__dirname, "../uploads");
const OPUS_DIR128 = path.join(__dirname, "../opus128");
const OPUS_DIR192 = path.join(__dirname, "../opus192");

// Ensure directories exist
[UPLOADS_DIR, OPUS_DIR128, OPUS_DIR192].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

module.exports = {
  getUploadsDir: () => UPLOADS_DIR,
  getOpusDir128: () => OPUS_DIR128,
  getOpusDir192: () => OPUS_DIR192,

  generateUniqueFileName: (originalName) => {
    return crypto.createHash('sha256').update(originalName).digest('hex').slice(0, 8);
  },

  generateRandomId: (length = 3) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  },  

  getOpusFilePath: (fileId, quality) => {
    if (quality === 128) {
      return path.join(OPUS_DIR128, `${fileId}-${quality}.opus`);
    }else{
      return path.join(OPUS_DIR192, `${fileId}-${quality}.opus`);
    }
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
