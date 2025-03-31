module.exports = {
  validateQuality: (quality) => {
    return constants.ALLOWED_QUALITIES.includes(quality);
  },
};
