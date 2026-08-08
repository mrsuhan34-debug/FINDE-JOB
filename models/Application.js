const mongoose = require('mongoose');
const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeUrl: String,
  coverNote: String,
  status: { type: String, enum: ['applied', 'reviewed', 'rejected', 'accepted'], default: 'applied' },
}, { timestamps: true });
ApplicationSchema.index({ job: 1, seeker: 1 }, { unique: true });
module.exports = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
