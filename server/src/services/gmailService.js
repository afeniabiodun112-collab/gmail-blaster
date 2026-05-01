const { google } = require('googleapis')

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

function getAuthUrl() {
  const oauth2Client = getOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  })
}

async function exchangeCodeForTokens(code) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

async function getGmailUserEmail(tokens) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials(tokens)
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const { data } = await oauth2.userinfo.get()
  return data.email
}

async function sendEmail(user, { to, subject, body }) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: user.gmailAccessToken,
    refresh_token: user.gmailRefreshToken
  })

  // Auto-refresh token if needed
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await require('../models/User').findByIdAndUpdate(user._id, {
        gmailAccessToken: tokens.access_token
      })
    }
  })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const message = [
    `From: ${user.name} <${user.gmailEmail}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    body
  ].join('\r\n')

  const encoded = Buffer.from(message).toString('base64url')

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded }
  })

  return result.data
}

// Warmup daily limits
function getDailyLimit(warmupDay) {
  if (warmupDay <= 3) return 20
  if (warmupDay <= 7) return 50
  if (warmupDay <= 14) return 100
  return 200
}

module.exports = {
  getAuthUrl,
  exchangeCodeForTokens,
  getGmailUserEmail,
  sendEmail,
  getDailyLimit
}
