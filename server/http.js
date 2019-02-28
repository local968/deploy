const config = require('../config')
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser')
const uuid = require('uuid');
const { redis } = require('./redis')
const { messageRouter } = require('./reboot')
const routes = require('./routes')
const path = require('path')
const axios = require('axios')
const fs = require('fs')

const app = express();

// fetch ip
app.set('trust proxy', true);

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  if (req.method == "OPTIONS") res.send(200);/*让options请求快速返回*/
  else next();
});

// We need the same instance of the session parser in express and
// WebSocket server.
const sessionParser = session({
  store: new RedisStore({ client: redis }),
  saveUninitialized: false,
  secret: config.secret,
  resave: false
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(sessionParser);
app.use(routes)
app.use(messageRouter)

// Serve static files from the 'static' folder.
app.use(express.static('static'));

// CRA routing
app.get('*', function (req, res) {
  const index = path.join(process.cwd(), 'static', 'index.html');
  if (fs.existsSync(index)) return res.sendFile(index)
  axios.get('http://localhost:3000').then(resp => res.send(resp.data))
});


// Create HTTP server by ourselves.
const server = http.createServer(app);

module.exports = { server, sessionParser };
