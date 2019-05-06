const { Router } = require('express');
const proxy = require('http-proxy-middleware');
const config = require('config');
const {GRAPHIC_SERVICE} = config.services;

const router = new Router();

const hpm = proxy({
	target: GRAPHIC_SERVICE,
	changeOrigin: true,
});


router.use("/*", hpm);

module.exports = router;
