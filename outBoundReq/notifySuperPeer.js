const axios = require("axios");
const logger = require("../utils/logger");
require("dotenv").config();

async function notifySuperPeer(trackId, publisherName, size) {
  await axios
    .post(`${process.env.SUPER_PEER_URL}/server/publishTrack`, {
      trackId,
      publisherName,
      size,
    })
    .then(() => {
      logger.info(`Notified super peer about trackId: ${trackId}`);
    })
    .catch((error) => {
      throw new Error(error);
    });
}

module.exports = notifySuperPeer;
