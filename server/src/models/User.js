const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  gmailAccessToken: { type: String, default: null },
  gmailRefreshToken: { type: String, default: null },
  gmailEmail: { type: String, default: null },
  gmailConnected: { type: Boolean, default: false },
  gmailWarmupDay: { type: Number, default: 1 },
  gmailDailySentCount: { type: Number, default: 0 },
  gmailLastSentDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.gmailAccessToken
  delete obj.gmailRefreshToken
  return obj
}

module.exports = mongoose.model('User', userSchema)
