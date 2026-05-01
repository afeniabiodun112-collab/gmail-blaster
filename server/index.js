require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cron = require('node-cron')

const path = require('path')

const app = express()

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/auth',      require('./src/routes/auth'))
app.use('/api/gmail',     require('./src/routes/gmail'))
app.use('/api/campaigns', require('./src/routes/campaigns'))

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Serve Static Files (Frontend)
const distPath = path.join(__dirname, '../client/dist')
app.use(express.static(distPath))

// Catch-all: serve index.html for any other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Cron: midnight — reset daily sent count + increment warmup day
cron.schedule('0 0 * * *', async () => {
  try {
    const User = require('./src/models/User')
    const result = await User.updateMany(
      { gmailConnected: true },
      { gmailDailySentCount: 0, $inc: { gmailWarmupDay: 1 } }
    )
    console.log(`Midnight cron: reset ${result.modifiedCount} users, incremented warmup day`)
  } catch (err) {
    console.error('Cron error:', err)
  }
})

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })

module.exports = app
