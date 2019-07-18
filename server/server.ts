import events from 'events';
import axios from 'axios';
import './log';
import { server, sessionParser } from './http';
import wssInit from './webSocket';
import { recover } from './reboot';
import config from '../config';

axios.defaults.maxContentLength = Infinity;

(events.EventEmitter.prototype as any)._maxListeners = 1000;

const wss = wssInit(server, sessionParser);
recover(wss);
// Start the server.
server.listen(config.port || 8080, () => {
  const applog = require('log4js').getLogger('app');
  console.log('Listening on port:' + config.port);
  applog.info('Listening on port:' + config.port);
});

export default {};
