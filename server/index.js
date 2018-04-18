const express = require('express');
const horizon = require('@horizon/server');
const config = require('../config.js');
const path = require('path');
const upload = require('./uploader');
const db = config.db;

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
app.use('/api/upload', upload);

// CRA routing
app.get('/*', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
});

require('./schedule');
