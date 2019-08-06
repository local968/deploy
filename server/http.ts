import config from '../config';
import session from 'express-session';
import ConnectRedis from 'connect-redis';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import { redis } from './redis';
import { messageRouter } from './reboot';
import routes from './routes';
import path from 'path';
import axios from 'axios';
import fs from 'fs';
import redirectGraphic from './routes/redirectGraphic';

const RedisStore = ConnectRedis(session);
const app = express();

// fetch ip
app.set('trust proxy', true);

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Content-Length, Authorization, Accept,X-Requested-With',
  );
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', ' 3.2.1');
  if (req.method == 'OPTIONS') res.send(200);
  /*让options请求快速返回*/ else next();
});

// We need the same instance of the session parser in express and
// WebSocket server.
export const sessionParser = session({
  store: new RedisStore({ client: redis }),
  saveUninitialized: false,
  secret: config.secret,
  resave: false,
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: '200mb' }));

// parse application/json

app.use(express.Router().use('/graphics', redirectGraphic));

app.use(bodyParser.json({ limit: '200mb' }));
app.use(sessionParser);
app.use(messageRouter);

// Serve static files from the 'static' folder.
app.use(express.static('static'));

app.use(routes);

// CRA routing
app.get('*', function(req, res) {
  const index = path.join(process.cwd(), 'static', 'index.html');
  if (fs.existsSync(index)){
    return res.sendFile(index)
  }
  axios.get('http://localhost:3000').then(resp => res.send(resp.data));
});

// Create HTTP server by ourselves.
export const server = http.createServer(app);
