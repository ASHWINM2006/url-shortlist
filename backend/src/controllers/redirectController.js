const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Visit = require('../models/Visit');

// @desc    Redirect short URL to original
// @route   GET /:shortCode
const redirect = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Skip API routes and static files
    if (shortCode.startsWith('api') || shortCode === 'favicon.ico') {
      return res.status(404).json({ error: 'Not found' });
    }

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.redirect(`${process.env.FRONTEND_URL}/not-found`);
    }

    // Check expiry
    if (url.isExpired()) {
      return res.redirect(`${process.env.FRONTEND_URL}/expired`);
    }

    // Parse user agent
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();

    const browser = result.browser.name || 'Unknown';
    const os = result.os.name || 'Unknown';
    const deviceType = result.device.type || 'desktop';

    // Get IP address
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    // Record visit asynchronously (don't block redirect)
    setImmediate(async () => {
      try {
        await Visit.create({
          url: url._id,
          ipAddress,
          userAgent: req.headers['user-agent'],
          browser,
          os,
          device: deviceType,
          referer: req.headers.referer || null
        });

        await Url.findByIdAndUpdate(url._id, {
          $inc: { totalClicks: 1 },
          lastVisited: new Date()
        });
      } catch (err) {
        console.error('Visit recording error:', err);
      }
    });

    // Redirect to original URL
    res.redirect(301, url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/error`);
  }
};

module.exports = { redirect };
