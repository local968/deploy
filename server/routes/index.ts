import { Router } from 'express';
import user from './user';
import upload from './upload';
import redirect from './redirect';
import redirectEs from './redirectEs';
import api from './api';
import './project';
import './deployment';
import './database';
import './etl';

const router = Router();

router.use('/user', user);
router.use('/upload', upload);
router.use('/redirect', redirect);
router.use('/etls', redirectEs);
router.use('/api', api);
router.get('/jupyterLabUrl', (req, res) =>
  res.send(process.env.JUPYTER_LAB || 'http://192.168.0.23:18888/notebook/lab'),
);

router.get('/dashboardUrl', (req, res) =>
  res.send(process.env.DASHBOARD_URL || 'https://192.168.0.23:16443/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/'),
);

export default router;