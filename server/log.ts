import path from 'path';
import fs from 'fs-extra';
import { configure } from 'log4js';

try {
  fs.mkdirSync('./logs');
} catch (e) {
  if (e.code !== 'EEXIST')
    console.error('Could not set up log directory, error was: ', e);
}

try {
  // const fs = require('fs')
  const logPath = path.join(__dirname, '..', 'logs');
  fs.ensureDirSync(logPath);
  const logs = fs.readdirSync(logPath);
  logs.forEach(log => {
    fs.unlinkSync(path.join(logPath, log));
  });
  // fs.mkdirSync('./logs');
} catch (e) {
  console.error('Could not set up log directory, error was: ', e);
}

configure({
  appenders: {
    app: {
      type: 'file',
      filename: 'logs/app.log',
      maxLogSize: 1024 * 1024 * 100,
      backups: 3,
    },
    error: {
      type: 'file',
      filename: 'logs/error.log',
      maxLogSize: 1024 * 1024 * 100,
      backups: 3,
    },
    user: {
      type: 'file',
      filename: 'logs/user.log',
      maxLogSize: 1024 * 1024 * 100,
      backups: 3,
    },
  },
  categories: {
    default: { appenders: ['app'], level: 'ALL' },
    error: { appenders: ['error'], level: 'ERROR' },
    user: { appenders: ['user'], level: 'ALL' },
  },
});

export default {};
