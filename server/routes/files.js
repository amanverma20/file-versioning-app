const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const upload = require('../services/upload');
const Repository = require('../models/Repository');
const File = require('../models/File');
const FileVersion = require('../models/FileVersion');

// Upload file to repository - creates or versions
router.post('/:repoId/upload', auth, upload.single('file'), async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    // check permission: owner or collaborator
    const allowed = repo.owner.equals(req.user._id) || repo.collaborators.includes(req.user._id);
    if (!allowed) return res.status(403).json({ message: 'No access to repository' });
    const { originalname, filename, size, mimetype } = req.file;
    // find existing file by original name within repo
    let file = await File.findOne({ repository: repo._id, originalName: originalname });
    if (!file) {
      file = new File({ repository: repo._id, filename, originalName: originalname });
      await file.save();
    }
    // determine next version number
    const lastVersion = await FileVersion.find({ file: file._id }).sort({ versionNumber: -1 }).limit(1);
    const nextVersion = lastVersion.length ? lastVersion[0].versionNumber + 1 : 1;
    const fv = new FileVersion({ file: file._id, versionNumber: nextVersion, filename, originalName: originalname, uploader: req.user._id, size, mimeType: mimetype });
    await fv.save();
    file.versions.push(fv._id);
    file.filename = filename; // update latest stored filename pointer
    await file.save();
    res.json({ file, version: fv });
  } catch (err) { next(err); }
});

// List files in repo
router.get('/:repoId', auth, async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    const allowed = repo.owner.equals(req.user._id) || repo.collaborators.includes(req.user._id);
    if (!allowed) return res.status(403).json({ message: 'No access to repository' });
    const files = await File.find({ repository: repo._id }).populate({ path: 'versions', options: { sort: { versionNumber: -1 } } });
    res.json(files);
  } catch (err) { next(err); }
});

// Get file versions
router.get('/:repoId/files/:fileId/versions', auth, async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    const allowed = repo.owner.equals(req.user._id) || repo.collaborators.includes(req.user._id);
    if (!allowed) return res.status(403).json({ message: 'No access to repository' });
    const versions = await FileVersion.find({ file: req.params.fileId }).sort({ versionNumber: -1 }).populate('uploader', 'name email');
    res.json(versions);
  } catch (err) { next(err); }
});

// Download specific version
router.get('/download/:versionId', auth, async (req, res, next) => {
  try {
    const fv = await FileVersion.findById(req.params.versionId).populate('file');
    if (!fv) return res.status(404).json({ message: 'Version not found' });
    const repo = await Repository.findById(fv.file.repository);
    const allowed = repo.owner.equals(req.user._id) || repo.collaborators.includes(req.user._id);
    if (!allowed) return res.status(403).json({ message: 'No access to repository' });
    const filePath = require('path').join(__dirname, '..', 'uploads', fv.filename);
    res.download(filePath, fv.originalName);
  } catch (err) { next(err); }
});

module.exports = router;
