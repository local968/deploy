const { Router } = require('express');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid/v1');
const basePath = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const _path = moment().format(`YYYY${path.sep}MM`);
    const fullPath = path.join(basePath, _path);
    fs.stat(fullPath, err => {
      if (err) {
        checkUploadsPath(_path);
        cb(null, fullPath);
      }
      cb(null, fullPath);
    });
  },
  filename: (req, file, cb) => {
    cb(null, uuid() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = new Router();

router.post('/', upload.single('data'), (req, res) => {
  res.json({
    path: path.join(moment().format(`YYYY${path.sep}MM`), req.file.filename),
    originalName: req.file.originalname,
    mimetype: req.file.mimetype
  });
});

router.get('/test', (req, res) => {
  res.send('ok');
});

const checkUploadsPath = _path => {
  const pathArr = _path.split(path.sep);
  const finalPath = pathArr.reduce((prev, cur, index) => {
    const __path = path.join(basePath, prev, cur);
    let stat;
    try {
      stat = fs.statSync(__path);
    } catch (err) {
      if (err) fs.mkdirSync(__path);
    }
    if (stat && !stat.isDirectory()) fs.mkdirSync(__path);
    return path.join(prev, cur);
  }, '');
};

module.exports = router;
