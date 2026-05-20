const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    default: 'Unknown'
  },
  referer: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  }
}, {
  timestamps: false
});

// Index for analytics queries
visitSchema.index({ url: 1, timestamp: -1 });
visitSchema.index({ url: 1, timestamp: 1 });

module.exports = mongoose.model('Visit', visitSchema);
