const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customAlias: {
    type: String,
    default: null,
    trim: true
  },
  title: {
    type: String,
    default: null,
    trim: true
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  lastVisited: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qrCode: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for fast lookup — shortCode index is handled by unique:true above
urlSchema.index({ user: 1, createdAt: -1 });

// Check if URL is expired
urlSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model('Url', urlSchema);
