const express = require('express')
const User = require('../models/User')
const { withAuth } = require('../middleware/auth')
const {
  getAuthUrl,
  exchangeCodeForTokens,
  getGmailUserEmail,
  getDailyLimit
} = require('../services/gmailService')

const router = express.Router()

// GET /api/gmail/connect
router.get('/connect', withAuth, (req, res) => {
  // Store userId in state param for callback
  const state = Buffer.from(JSON.stringify({ userId: req.user._id.toString() })).toString('base64')
  const authUrl = getAuthUrl() + `&state=${encodeURIComponent(state)}`
  res.json({ authUrl })
})

// GET /api/gmail/callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query

    if (error) {
      return res.redirect(`${process.env.CLIENT_URL}/settings?error=${encodeURIComponent(error)}`)
    }

    if (!code || !state) {
      return res.redirect(`${process.env.CLIENT_URL}/settings?error=missing_params`)
    }

    let userId
    try {
      const decoded = JSON.parse(Buffer.from(decodeURIComponent(state), 'base64').toString())
      userId = decoded.userId
    } catch {
      return res.redirect(`${process.env.CLIENT_URL}/settings?error=invalid_state`)
    }

    const tokens = await exchangeCodeForTokens(code)
    const gmailEmail = await getGmailUserEmail(tokens)

    await User.findByIdAndUpdate(userId, {
      gmailAccessToken: tokens.access_token,
      gmailRefreshToken: tokens.refresh_token || undefined,
      gmailEmail,
      gmailConnected: true
    })

    res.redirect(`${process.env.CLIENT_URL}/settings?connected=true`)
  } catch (err) {
    console.error('Gmail callback error:', err)
    res.redirect(`${process.env.CLIENT_URL}/settings?error=${encodeURIComponent(err.message)}`)
  }
})

// DELETE /api/gmail/disconnect
router.delete('/disconnect', withAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      gmailAccessToken: null,
      gmailRefreshToken: null,
      gmailEmail: null,
      gmailConnected: false,
      gmailWarmupDay: 1,
      gmailDailySentCount: 0
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Disconnect error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/gmail/status
router.get('/status', withAuth, async (req, res) => {
  const user = req.user
  const dailyLimit = getDailyLimit(user.gmailWarmupDay)

  // Reset daily count if new day
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let sentToday = user.gmailDailySentCount
  if (!user.gmailLastSentDate || user.gmailLastSentDate < today) {
    sentToday = 0
  }

  res.json({
    connected: user.gmailConnected,
    gmailEmail: user.gmailEmail,
    warmupDay: user.gmailWarmupDay,
    dailyLimit,
    sentToday,
    remaining: Math.max(0, dailyLimit - sentToday)
  })
})

module.exports = router
