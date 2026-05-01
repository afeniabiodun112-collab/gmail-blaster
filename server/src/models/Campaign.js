const mongoose = require('mongoose')

const campaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  recipients: [{ type: String }],
  totalCount: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'sending', 'completed', 'paused', 'failed'],
    default: 'draft'
  },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Campaign', campaignSchema)
