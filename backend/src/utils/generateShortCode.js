const { nanoid } = require('nanoid');
const Url = require('../models/Url');

const generateUniqueShortCode = async (length = 7) => {
  let shortCode;
  let exists = true;

  while (exists) {
    shortCode = nanoid(length);
    const existing = await Url.findOne({ shortCode });
    exists = !!existing;
  }

  return shortCode;
};

const isValidAlias = (alias) => {
  // Only allow alphanumeric, hyphens, underscores, 3-30 chars
  return /^[a-zA-Z0-9_-]{3,30}$/.test(alias);
};

module.exports = { generateUniqueShortCode, isValidAlias };
