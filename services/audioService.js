const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const fileService = require("./fileService");
const logger = require("../utils/logger");
const constants = require("../utils/constants");
const ffmpeg = require("ffmpeg-static"); // Ensure ffmpeg-static is installed
const fs = require("fs/promises");

// Helper function for conversion
async function convertToOpus(inputPath, outputPath, bitrate) {
  try {
    const { stderr } = await execPromise(
      `"${ffmpeg}" -i "${inputPath}" -c:a libopus -b:a ${bitrate}k -vbr on -compression_level 10 "${outputPath}"`
    );
    if (stderr) logger.debug(`FFmpeg output: ${stderr}`);
    return true;
  } catch (err) {
    logger.error(`Conversion error for ${outputPath}: ${err.stderr}`);
    throw err;
  }
}

module.exports = {
  convertToOpusFormats: async (inputPath, fileId) => {
    try {
      const conversions = constants.ALLOWED_QUALITIES.map(async (quality) => {
        const outputPath = fileService.getOpusFilePath(fileId, quality);
        await convertToOpus(inputPath, outputPath, quality);

        // Get file size in bytes after conversion
        const stats = await fs.stat(outputPath);

        return {
          quality,
          path: outputPath,
          size: stats.size, // in bytes
        };
      });

      const results = await Promise.all(conversions);
      return results;
    } catch (err) {
      logger.error("Audio conversion failed:", err);
      throw err;
    }
  },

  convertToOpus, // Also export the single conversion function if needed elsewhere
};
