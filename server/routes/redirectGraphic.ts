import express from 'express';
import proxy from 'http-proxy-middleware';
import config from '../../config';
const { GRAPHIC_SERVICE } = config.services;

const router = express.Router();

const hpm = proxy({
  target: GRAPHIC_SERVICE,
  changeOrigin: true,
});

router.use('/*', hpm);

export default router;
