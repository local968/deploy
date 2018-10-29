const PORT = process.env.PORT || 8080
const FRONTEND_PORT = process.env.FRONTEND_PORT || PORT
const NGINX_BACKEND = process.env.NGINX_BACKEND || 1

const defaultConfig = {
  uploadBackend: NGINX_BACKEND,
  port: FRONTEND_PORT
}

let localConfig = {}
try {
  localConfig = require('./local_config.js');
} catch (e) { }

export default { ...defaultConfig, ...localConfig }
