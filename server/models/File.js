const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  versions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileVersion' }],
}, { timestamps: true });

module.exports = mongoose.model('File', FileSchema);
