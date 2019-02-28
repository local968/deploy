const FRONTEND_HOST = process.env.REACT_APP_FRONTEND_HOST || window.location.hostname;
const FRONTEND_PORT = process.env.REACT_APP_FRONTEND_PORT || window.location.port;
const NGINX_BACKEND = process.env.REACT_APP_NGINX_BACKEND || 1;

const config = {
  uploadBackend: NGINX_BACKEND,
  port: FRONTEND_PORT,
  host: FRONTEND_HOST
};

window.config = config;

export default config
