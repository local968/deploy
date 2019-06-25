import express from 'express';
import proxy from 'http-proxy-middleware';
import config from '../../config';

const { ETL_SERVICE } = config.services;
const router = express.Router();

const hpm = proxy({
  target: ETL_SERVICE,
  changeOrigin: true,
});

console.log('ETL_SERVICE', ETL_SERVICE);

router.use('/*', hpm);

export default router;
