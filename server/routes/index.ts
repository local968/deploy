import { Router } from 'express';
import user from './user';
import upload from './upload';
import redirect from './redirect';
import redirectEs from './redirectEs';
import redirectUpload from "./redirectUpload"
import image from "./image"
import api from './api';
import project from './project';
import './deployment';
import './database';
import './etl';

const router = Router();

router.use("/image", image);
router.use('/user', user);
router.use('/upload', upload);
router.use('/redirect', redirect);
router.use('/etls', redirectEs);
router.use("/uploads", redirectUpload);
router.use('/api', api);
router.use("/project", project);
router.get('/jupyterLabUrl', (req, res) =>
  res.send(process.env.JUPYTER_LAB || '/notebook/lab'),
);

router.get('/dashboardUrl', (req, res) =>
  res.send(process.env.DASHBOARD_URL || '/kubernetes/dashboard'),
);

export default router;
