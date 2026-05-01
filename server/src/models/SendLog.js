const mongoose = require('mongoose')

const sendLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  recipientEmail: { type: String, required: true },
  gmailMessageId: { type: String, default: null },
  gmailThreadId: { type: String, default: null },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  error: { type: String, default: null },
  sentAt: { type: Date, default: Date.now }
})

sendLogSchema.index({ campaignId: 1 })
sendLogSchema.index({ userId: 1 })

module.exports = mongoose.model('SendLog', sendLogSchema)
