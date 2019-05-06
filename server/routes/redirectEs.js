const { Router } = require('express');
const proxy = require('http-proxy-middleware');
const config = require('config');
const {ETL_SERVICE,GRAPHIC_SERVICE} = config.services;

const router = new Router();

const hpm = proxy({
  target: ETL_SERVICE,
  changeOrigin: true,
});


router.use("/*", hpm);

module.exports = router;
