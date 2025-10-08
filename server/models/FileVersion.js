const mongoose = require('mongoose');

const FileVersionSchema = new mongoose.Schema({
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  versionNumber: { type: Number, required: true },
  filename: { type: String, required: true }, // stored filename on disk
  originalName: { type: String, required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  size: { type: Number },
  mimeType: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('FileVersion', FileVersionSchema);
