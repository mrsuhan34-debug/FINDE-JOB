const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'employer', 'admin'], default: 'seeker' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  skills: [String],
  location: String,
  resumeUrl: String,
  companyName: String,
  companyLogoUrl: String,
  lastLoginAt: { type: Date },
}, { timestamps: true });
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
