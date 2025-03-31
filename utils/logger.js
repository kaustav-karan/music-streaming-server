const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
  flags: "a",
});

const errorLogStream = fs.createWriteStream(path.join(logsDir, "error.log"), {
  flags: "a",
});

module.exports = {
  requestLogger: morgan("combined", { stream: accessLogStream }),

  info: (message) => {
    console.log(`[INFO] ${message}`);
  },

  warn: (message) => {
    console.warn(`[WARN] ${message}`);
    errorLogStream.write(`[WARN] ${message}\n`);
  },

  error: (message) => {
    console.error(`[ERROR] ${message}`);
    errorLogStream.write(`[ERROR] ${message}\n`);
  },

  debug: (message) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`);
    }
  },
};
