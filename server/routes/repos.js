const express = require('express');
const Repository = require('../models/Repository');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create repository
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const repo = new Repository({ name, description, owner: req.user._id });
    await repo.save();
    res.json(repo);
  } catch (err) { next(err); }
});

// Get user's repositories (owned or collaborator)
router.get('/', auth, async (req, res, next) => {
  try {
    const repos = await Repository.find({ $or: [{ owner: req.user._id }, { collaborators: req.user._id }] }).populate('owner', 'name email');
    res.json(repos);
  } catch (err) { next(err); }
});

// Get single repo
router.get('/:id', auth, async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id).populate('owner', 'name email').populate('collaborators', 'name email');
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    res.json(repo);
  } catch (err) { next(err); }
});

// Update repo (only owner)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    if (!repo.owner.equals(req.user._id)) return res.status(403).json({ message: 'Only owner can update' });
    Object.assign(repo, req.body);
    await repo.save();
    res.json(repo);
  } catch (err) { next(err); }
});

// Delete repo (only owner) — perform cascade cleanup of files and versions
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    if (!repo.owner.equals(req.user._id)) return res.status(403).json({ message: 'Only owner can delete' });

    // find all files under this repository
    const File = require('../models/File');
    const FileVersion = require('../models/FileVersion');
    const files = await File.find({ repository: repo._id });

    // delete physical files and file version docs
    const fs = require('fs');
    const path = require('path');
    for (const f of files) {
      const versions = await FileVersion.find({ file: f._id });
      for (const v of versions) {
        try {
          const p = path.join(__dirname, '..', 'uploads', v.filename);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch (e) {
          console.warn('Failed to remove file from disk', e);
        }
        await v.remove();
      }
      await f.remove();
    }

    await Repository.findByIdAndDelete(repo._id);
    res.json({ message: 'Repository deleted' });
  } catch (err) { next(err); }
});

// Add collaborator (owner only)
router.post('/:id/collaborators', auth, async (req, res, next) => {
  try {
    const { email } = req.body;
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repository not found' });
    if (!repo.owner.equals(req.user._id)) return res.status(403).json({ message: 'Only owner can add collaborators' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (repo.collaborators.includes(user._id)) return res.status(400).json({ message: 'Already a collaborator' });
    repo.collaborators.push(user._id);
    await repo.save();
    res.json(repo);
  } catch (err) { next(err); }
});

module.exports = router;
