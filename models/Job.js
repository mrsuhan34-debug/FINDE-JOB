const mongoose = require('mongoose');
const JobSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  companyName: String,
  companyLogoUrl: String,
  description: { type: String, required: true },
  category: { type: String, default: '' },
  type: { type: String, default: 'Full-time' },
  locationType: { type: String, default: 'Remote' },
  country: String,
  salaryRange: String,
  status: { type: String, enum: ['open', 'closed', 'hidden'], default: 'open' },
}, { timestamps: true });
module.exports = mongoose.models.Job || mongoose.model('Job', JobSchema);
