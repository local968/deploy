const express = require('express');
const horizon = require('@horizon/server');
const config = require('../config.js');
const path = require('path');
const fs = require('fs');
const upload = require('./uploader');
const Download = require('./download');
const db = config.db;
const multiparty = require('multiparty');

const app = express();

app.get('/test', (req, res) => {
  res.send('ok');
});

const port = parseInt(process.env.httpPort) + 2;
httpServer = app.listen(port, '0.0.0.0', err => {
  if (err) {
    console.log(err, port); // eslint-disable-line
    return;
  }

  console.log(`Website server listening at http://${config.host}:${port}`); // eslint-disable-line
});

const horizonServer = horizon(httpServer, {
  auto_create_collection: true,
  auto_create_index: true,
  project_name: db.name,
  rdb_port: db.port,
  rdb_host: db.host,
  permissions: false, // waiting for additions to permission system atm
  auth: {
    allow_anonymous: true,
    allow_unauthenticated: true,
    token_secret: config.token_secret
  }
});

app.use(express.static(path.join(process.cwd(), 'build')));
// app.use('/api/upload', upload);


app.post('/api/sample', (req, res) => {
  const {type, filename, userId, projectId} = req.query;
  // const projPath = path.resolve(__dirname, '../..');
  const samplePath = path.join(config.projPath, 'sample', type, filename);
  const destDir = path.join(config.projPath, 'data', userId, projectId);
  if (!fs.existsSync(destDir)) {
    createFilePath(filePath)
  }
  fs.copyFile(samplePath, path.join(destDir, filename), err => {
    if (err) return res.status(500).json({message: err});
    return res.json({message: 'sample copy finished'});
  });
});

app.post('/api/upload', (req, res) => {
  // locate file path
  const {userId, projectId, approachId} = req.query;
  // const projPath = path.resolve(__dirname, '../..');
  const approach = approachId || '';
  const filePath = path.join(config.projPath, 'data', userId, projectId, approach);
  if (!fs.existsSync(filePath)) {
    createFilePath(filePath)
  }

  const form = new multiparty.Form({uploadDir: filePath});
  form.parse(req, function(err) {
    
  });
  form.on('file', function(name, file) {
    fs.rename(file.path, path.join(filePath, file.originalFilename), err => {
      if (err) {
        return res.status(500).json({message: err});
      }
      return res.json({message: 'upload finished'});
    });
  });
});

app.get('/api/download', (req,res) => {
  const {userId, projectId, approachId, csvLocation} = req.query;
  const approach = approachId || '';
  const file = path.join(config.projPath, 'data', userId, projectId, approach, csvLocation);
  const download = Download(req ,res);
  download.download(file, csvLocation);
})

app.get('/api/sign', (req,res) => {
  const {userId, projectId, approachId, csvLocation} = req.query;
  const approach = approachId || '';
  const file = path.join(config.projPath, 'data', userId, projectId, approach, csvLocation);
  const download = Download(req ,res);
  download.sign(file, csvLocation);
})

const createFilePath = (filePath) => {
  let dirArr = filePath.split(path.sep);
  dirArr.reduce((prev, current) => {
    if(!prev){
      prev = path.sep;
    }
    let currentPath = path.join(prev, current);
    if(!fs.existsSync(currentPath)){
      fs.mkdirSync(currentPath);
    }
    return currentPath;
  });
}

// CRA routing
app.get('/*', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
});

require('./schedule');
