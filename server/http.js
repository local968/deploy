const config = require('../config')
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser')
const uuid = require('uuid');
const { redis } = require('./redis')
const routes = require('./routes')

const app = express();

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

// Serve static files from the 'public' folder.
app.use(express.static('public'));

// Create HTTP server by ourselves.
const server = http.createServer(app);

module.exports = { server, sessionParser };
