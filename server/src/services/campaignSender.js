const Campaign = require('../models/Campaign')
const User = require('../models/User')
const SendLog = require('../models/SendLog')
const { sendEmail, getDailyLimit } = require('./gmailService')

// Track active campaigns to prevent duplicate sends
const activeCampaigns = new Set()

async function sendCampaign(campaignId, userId) {
  const campaignKey = `${userId}:${campaignId}`

  if (activeCampaigns.has(campaignKey)) {
    throw new Error('Campaign is already sending')
  }

  activeCampaigns.add(campaignKey)

  try {
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) throw new Error('Campaign not found')

    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    if (!user.gmailConnected) throw new Error('Gmail not connected')

    // Reset daily count if it's a new day
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!user.gmailLastSentDate || user.gmailLastSentDate < today) {
      await User.findByIdAndUpdate(userId, {
        gmailDailySentCount: 0,
        gmailLastSentDate: new Date()
      })
      user.gmailDailySentCount = 0
    }

    const limit = getDailyLimit(user.gmailWarmupDay)
    let sentToday = user.gmailDailySentCount

    campaign.status = 'sending'
    if (!campaign.startedAt) campaign.startedAt = new Date()
    await campaign.save()

    // Start from where we left off
    const unsent = campaign.recipients.slice(campaign.sentCount)

    for (const recipientEmail of unsent) {
      // Re-check campaign status (may have been paused externally)
      const freshCampaign = await Campaign.findById(campaignId)
      if (freshCampaign.status === 'paused') {
        break
      }

      // Check daily limit
      if (sentToday >= limit) {
        await Campaign.findByIdAndUpdate(campaignId, { status: 'paused' })
        console.log(`Campaign ${campaignId} paused: daily limit of ${limit} reached`)
        break
      }

      try {
        const freshUser = await User.findById(userId)

        const result = await sendEmail(freshUser, {
          to: recipientEmail,
          subject: campaign.subject,
          body: campaign.body
        })

        await SendLog.create({
          userId,
          campaignId,
          recipientEmail,
          gmailMessageId: result.id,
          gmailThreadId: result.threadId,
          status: 'sent',
          sentAt: new Date()
        })

        await Campaign.findByIdAndUpdate(campaignId, { $inc: { sentCount: 1 } })
        await User.findByIdAndUpdate(userId, {
          $inc: { gmailDailySentCount: 1 },
          gmailLastSentDate: new Date()
        })

        sentToday += 1

        console.log(`Sent to ${recipientEmail} (${sentToday}/${limit} today)`)

        // 3 second delay between sends
        await new Promise(r => setTimeout(r, 3000))

      } catch (err) {
        console.error(`Failed to send to ${recipientEmail}:`, err.message)

        await SendLog.create({
          userId,
          campaignId,
          recipientEmail,
          status: 'failed',
          error: err.message,
          sentAt: new Date()
        })

        await Campaign.findByIdAndUpdate(campaignId, { $inc: { failedCount: 1 } })

        // Short delay even on failure
        await new Promise(r => setTimeout(r, 1000))
      }
    }

    // Final status update
    const finalCampaign = await Campaign.findById(campaignId)
    if (finalCampaign.status === 'sending') {
      const totalProcessed = finalCampaign.sentCount + finalCampaign.failedCount
      if (totalProcessed >= finalCampaign.recipients.length) {
        await Campaign.findByIdAndUpdate(campaignId, {
          status: 'completed',
          completedAt: new Date()
        })
        console.log(`Campaign ${campaignId} completed`)
      }
    }

  } finally {
    activeCampaigns.delete(campaignKey)
  }
}

function isCampaignActive(campaignId, userId) {
  return activeCampaigns.has(`${userId}:${campaignId}`)
}

module.exports = { sendCampaign, isCampaignActive }
