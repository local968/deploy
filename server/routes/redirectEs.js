const { Router } = require('express');
const proxy = require('http-proxy-middleware');
const config = require('config');
const {ETL_SERVICE} = config.services;

const router = new Router();

const hpm = proxy({
  target: ETL_SERVICE,
  changeOrigin: true,
});

console.log('ETL_SERVICE',ETL_SERVICE)


router.use("/*", hpm);

module.exports = router;
