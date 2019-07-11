import express from 'express';
import proxy from 'http-proxy-middleware'
import config from '../../config'

const router = express.Router();

const hpm = proxy({
	target: config.STRAPI,
	changeOrigin: true,
});


router.use("/*", hpm);

export default router;

