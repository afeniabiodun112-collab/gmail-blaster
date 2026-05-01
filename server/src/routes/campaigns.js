const express = require('express')
const Campaign = require('../models/Campaign')
const SendLog = require('../models/SendLog')
const { withAuth } = require('../middleware/auth')
const { sendCampaign, isCampaignActive } = require('../services/campaignSender')

const router = express.Router()

// POST /api/campaigns
router.post('/', withAuth, async (req, res) => {
  try {
    const { name, subject, body, recipients } = req.body

    if (!name || !subject || !body || !recipients) {
      return res.status(400).json({ error: 'name, subject, body, and recipients are required' })
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'recipients must be a non-empty array' })
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validRecipients = recipients
      .map(e => e.trim().toLowerCase())
      .filter(e => emailRegex.test(e))

    // Remove duplicates
    const uniqueRecipients = [...new Set(validRecipients)]

    if (uniqueRecipients.length === 0) {
      return res.status(400).json({ error: 'No valid email addresses found' })
    }

    const campaign = await Campaign.create({
      userId: req.user._id,
      name,
      subject,
      body,
      recipients: uniqueRecipients,
      totalCount: uniqueRecipients.length
    })

    res.status(201).json({ campaign })
  } catch (err) {
    console.error('Create campaign error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/campaigns
router.get('/', withAuth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-recipients')

    res.json({ campaigns })
  } catch (err) {
    console.error('List campaigns error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/campaigns/:id
router.get('/:id', withAuth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    const logs = await SendLog.find({ campaignId: campaign._id })
      .sort({ sentAt: -1 })
      .limit(200)

    const isActive = isCampaignActive(campaign._id.toString(), req.user._id.toString())

    res.json({ campaign, logs, isActive })
  } catch (err) {
    console.error('Get campaign error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/campaigns/:id/send
router.post('/:id/send', withAuth, async (req, res) => {
  try {
    if (!req.user.gmailConnected) {
      return res.status(400).json({ error: 'Gmail not connected. Please connect your Gmail in Settings.' })
    }

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    if (campaign.status === 'completed') {
      return res.status(400).json({ error: 'Campaign is already completed' })
    }

    if (campaign.status === 'sending') {
      return res.status(400).json({ error: 'Campaign is already sending' })
    }

    // Fire and forget — runs in background
    sendCampaign(campaign._id.toString(), req.user._id.toString()).catch(err => {
      console.error(`Campaign ${campaign._id} error:`, err.message)
      Campaign.findByIdAndUpdate(campaign._id, { status: 'failed' }).catch(() => {})
    })

    res.json({ message: 'Campaign sending started', status: 'sending' })
  } catch (err) {
    console.error('Send campaign error:', err)
    res.status(500).json({ error: err.message || 'Server error' })
  }
})

// POST /api/campaigns/:id/pause
router.post('/:id/pause', withAuth, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'paused' },
      { new: true }
    )

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    res.json({ campaign })
  } catch (err) {
    console.error('Pause campaign error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/campaigns/:id
router.delete('/:id', withAuth, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    await SendLog.deleteMany({ campaignId: campaign._id })

    res.json({ success: true })
  } catch (err) {
    console.error('Delete campaign error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
