

const PORT = process.env.PORT || 8080 
const FRONTEND_PORT = process.env.FRONTEND_PORT || PORT
const NGINX_HOST = process.env.NGINX_HOST || '192.168.0.3:8088' 
const NGINX_BACKEND = process.env.NGINX_BACKEND || 1 

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
