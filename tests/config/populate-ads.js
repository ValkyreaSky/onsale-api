const Ad = require('../../api/models/Ad');

const adCreateData = {
  title: 'Proin quam nunc, dictum eget suscipit nec, dignissim ut nisl',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu vulputate nunc, quis molestie risus. Sed lacinia varius elit, vel fringilla mauris dignissim sed. Vivamus mauris arcu, tincidunt ac tortor sed, egestas faucibus purus. Pellentesque nulla odio, malesuada quis viverra a, porta sed odio. Maecenas sit amet nisl nulla. Nam tempus libero sem.',
  location: 'Fusce',
  price: 300,
  isUsed: true,
  category: 2,
  phone: '601601601',
};

// This function clears Ads collection, creates new ad and returns its ID
const populateAds = (existingUserId) => {
  return new Promise((resolve) => {
    Ad.deleteMany({}, (adsClearErr) => {
      if (adsClearErr) throw adsClearErr;
      const ad = new Ad(adCreateData);
      ad.owner = existingUserId;
      ad.save((adSaveErr, createdAd) => {
        if (adSaveErr) throw adSaveErr;
        resolve(createdAd.id);
      });
    });
  });
};

module.exports = populateAds;
