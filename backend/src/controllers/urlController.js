const { validationResult } = require('express-validator');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { generateUniqueShortCode, isValidAlias } = require('../utils/generateShortCode');

// @desc    Create short URL
// @route   POST /api/urls
const createUrl = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { originalUrl, customAlias, title, expiresAt } = req.body;

    let shortCode;

    if (customAlias) {
      if (!isValidAlias(customAlias)) {
        return res.status(400).json({
          error: 'Custom alias must be 3-30 characters and contain only letters, numbers, hyphens, or underscores'
        });
      }

      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) {
        return res.status(400).json({ error: 'This custom alias is already taken' });
      }

      shortCode = customAlias;
    } else {
      shortCode = await generateUniqueShortCode();
    }

    const urlData = {
      user: req.user._id,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      title: title || null
    };

    if (expiresAt) {
      const expDate = new Date(expiresAt);
      if (expDate <= new Date()) {
        return res.status(400).json({ error: 'Expiry date must be in the future' });
      }
      urlData.expiresAt = expDate;
    }

    const url = await Url.create(urlData);

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    res.status(201).json({
      message: 'Short URL created successfully',
      url: {
        ...url.toObject(),
        shortUrl
      }
    });
  } catch (error) {
    console.error('Create URL error:', error);
    res.status(500).json({ error: 'Server error creating short URL' });
  }
};

// @desc    Get all URLs for current user
// @route   GET /api/urls
const getUrls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = { user: req.user._id };
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const [urls, total] = await Promise.all([
      Url.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Url.countDocuments(query)
    ]);

    const baseUrl = process.env.BASE_URL;
    const urlsWithShort = urls.map(url => ({
      ...url.toObject(),
      shortUrl: `${baseUrl}/${url.shortCode}`,
      isExpired: url.isExpired()
    }));

    res.json({
      urls: urlsWithShort,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get URLs error:', error);
    res.status(500).json({ error: 'Server error fetching URLs' });
  }
};

// @desc    Get single URL
// @route   GET /api/urls/:id
const getUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({
      url: {
        ...url.toObject(),
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        isExpired: url.isExpired()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update URL
// @route   PUT /api/urls/:id
const updateUrl = async (req, res) => {
  try {
    const { originalUrl, title, expiresAt, isActive } = req.body;

    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (originalUrl) {
      try {
        new URL(originalUrl);
        url.originalUrl = originalUrl;
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }
    }

    if (title !== undefined) url.title = title;
    if (isActive !== undefined) url.isActive = isActive;

    if (expiresAt !== undefined) {
      if (expiresAt === null) {
        url.expiresAt = null;
      } else {
        const expDate = new Date(expiresAt);
        if (expDate <= new Date()) {
          return res.status(400).json({ error: 'Expiry date must be in the future' });
        }
        url.expiresAt = expDate;
      }
    }

    await url.save();

    res.json({
      message: 'URL updated successfully',
      url: {
        ...url.toObject(),
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        isExpired: url.isExpired()
      }
    });
  } catch (error) {
    console.error('Update URL error:', error);
    res.status(500).json({ error: 'Server error updating URL' });
  }
};

// @desc    Delete URL
// @route   DELETE /api/urls/:id
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Delete associated visits
    await Visit.deleteMany({ url: url._id });
    await url.deleteOne();

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ error: 'Server error deleting URL' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/urls/stats/overview
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalUrls, totalClicks, recentUrls, topUrls] = await Promise.all([
      Url.countDocuments({ user: userId }),
      Url.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$totalClicks' } } }
      ]),
      Url.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
      Url.find({ user: userId }).sort({ totalClicks: -1 }).limit(5)
    ]);

    const baseUrl = process.env.BASE_URL;

    res.json({
      stats: {
        totalUrls,
        totalClicks: totalClicks[0]?.total || 0,
        activeUrls: await Url.countDocuments({ user: userId, isActive: true }),
        expiredUrls: await Url.countDocuments({
          user: userId,
          expiresAt: { $lt: new Date() }
        })
      },
      recentUrls: recentUrls.map(u => ({
        ...u.toObject(),
        shortUrl: `${baseUrl}/${u.shortCode}`
      })),
      topUrls: topUrls.map(u => ({
        ...u.toObject(),
        shortUrl: `${baseUrl}/${u.shortCode}`
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
};

module.exports = { createUrl, getUrls, getUrl, updateUrl, deleteUrl, getDashboardStats };
