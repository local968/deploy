const config = require('../config')
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const express = require('express');
const http = require('http');
const uuid = require('uuid');
const { redis } = require('./redis')

const app = express();

// We need the same instance of the session parser in express and
// WebSocket server.
const sessionParser = session({
  store: new RedisStore({ client: redis }),
  saveUninitialized: false,
  secret: config.secret,
  resave: false
});

// Serve static files from the 'public' folder.
app.use(express.static('build'));
app.use(sessionParser);

app.get('/login', (req, res) => {
  // "Log in" user and set userId to session.
  const id = uuid.v4();

  console.log(`Updating session for user ${id}`);
  req.session.userId = id;
  res.send({ result: 'OK', message: 'Session updated' });
});

app.delete('/logout', (request, response) => {
  console.log('Destroying session');
  request.session.destroy();
  response.send({ result: 'OK', message: 'Session destroyed' });
});

// Create HTTP server by ourselves.
const server = http.createServer(app);

module.exports = { server, sessionParser };
