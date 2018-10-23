const PORT = 8080 || process.env.PORT
const FRONTEND_PORT = PORT || process.env.FRONTEND_PORT
const NGINX_HOST = '192.168.0.3:8088' || process.env.NGINX_HOST
const NGINX_BACKEND = 1 || process.env.NGINX_BACKEND

const defaultConfig = {
  uploadServer: NGINX_HOST,
  uploadBackend: NGINX_BACKEND,
  port: FRONTEND_PORT
}

let localConfig = {};
// try {
//   localConfig = require('../local_config.js').client;
// } catch (e) { }

export default { ...defaultConfig, ...localConfig }
