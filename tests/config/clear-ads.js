const Ad = require('../../api/models/Ad');

// This function clears Ads collection
const clearAds = () => {
  return new Promise((resolve) => {
    Ad.deleteMany({}, (adsClearErr) => {
      if (adsClearErr) throw adsClearErr;
      resolve();
    });
  });
};

module.exports = clearAds;
