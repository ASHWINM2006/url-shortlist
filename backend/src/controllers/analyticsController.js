const Url = require('../models/Url');
const Visit = require('../models/Visit');

// @desc    Get analytics for a specific URL
// @route   GET /api/analytics/:urlId
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.urlId, user: req.user._id });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const baseUrl = process.env.BASE_URL;

    // Recent visits (last 20)
    const recentVisits = await Visit.find({ url: url._id })
      .sort({ timestamp: -1 })
      .limit(20);

    // Daily clicks for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyClicks = await Visit.aggregate([
      {
        $match: {
          url: url._id,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Browser breakdown
    const browserStats = await Visit.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // OS breakdown
    const osStats = await Visit.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: '$os', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Device breakdown
    const deviceStats = await Visit.aggregate([
      { $match: { url: url._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Fill in missing days with 0 clicks
    const filledDailyClicks = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = dailyClicks.find(d => d._id === dateStr);
      filledDailyClicks.push({
        date: dateStr,
        clicks: found ? found.count : 0
      });
    }

    res.json({
      url: {
        ...url.toObject(),
        shortUrl: `${baseUrl}/${url.shortCode}`,
        isExpired: url.isExpired()
      },
      analytics: {
        totalClicks: url.totalClicks,
        lastVisited: url.lastVisited,
        recentVisits,
        dailyClicks: filledDailyClicks,
        browserStats: browserStats.map(b => ({ name: b._id || 'Unknown', value: b.count })),
        osStats: osStats.map(o => ({ name: o._id || 'Unknown', value: o.count })),
        deviceStats: deviceStats.map(d => ({ name: d._id || 'Unknown', value: d.count }))
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};

// @desc    Get overall analytics for user
// @route   GET /api/analytics/overview
const getOverviewAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all URL IDs for this user
    const userUrls = await Url.find({ user: userId }).select('_id');
    const urlIds = userUrls.map(u => u._id);

    // Daily clicks for last 30 days across all URLs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyClicks = await Visit.aggregate([
      {
        $match: {
          url: { $in: urlIds },
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days
    const filledDailyClicks = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = dailyClicks.find(d => d._id === dateStr);
      filledDailyClicks.push({
        date: dateStr,
        clicks: found ? found.count : 0
      });
    }

    // Top performing URLs
    const topUrls = await Url.find({ user: userId })
      .sort({ totalClicks: -1 })
      .limit(5);

    const baseUrl = process.env.BASE_URL;

    res.json({
      dailyClicks: filledDailyClicks,
      topUrls: topUrls.map(u => ({
        id: u._id,
        shortCode: u.shortCode,
        shortUrl: `${baseUrl}/${u.shortCode}`,
        originalUrl: u.originalUrl,
        title: u.title,
        totalClicks: u.totalClicks
      }))
    });
  } catch (error) {
    console.error('Overview analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getUrlAnalytics, getOverviewAnalytics };
