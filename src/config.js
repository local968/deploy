const PORT = process.env.PORT || 8080
const FRONTEND_PORT = process.env.FRONTEND_PORT || PORT
const NGINX_BACKEND = process.env.NGINX_BACKEND || 1
const NGINX_PORT = process.env.NGINX_PORT || 8088

const defaultConfig = {
  uploadBackend: NGINX_BACKEND,
  port: FRONTEND_PORT,
  nginxPort: NGINX_PORT
}

let localConfig = {}
try {
  localConfig = require('./local_config.js');
} catch (e) { }

export default { ...defaultConfig, ...localConfig }
