import express from 'express';
import { redis } from '../redis';
import proxy from 'http-proxy-middleware';

const router = express.Router();

const getHost = (req, res, next) => {
  const { query, body } = req;

  const { projectId = body.projectId } = query;

  if (!projectId) {
    res.send({
      status: 430,
      message: 'projectId empty',
      error: 'projectId empty',
    });
    return;
  }
  redis.hget(`project:${projectId}`, `host`).then(url => {
    req.proxyHost = JSON.parse(url);
    req.filename = query.filename;
    next();
  });
};

const hpm = proxy({
  target: 'http://127.0.0.1',
  pathRewrite: {
    '^/redirect/*': '/',
  },
  router: req => {
    return '//' + req.proxyHost;
  },
  onProxyRes: (proxyRes, req, res) => {
    // const header = { ...proxyRes.headers }
    // delete header.connection
    // res.headers = header

    if (req.baseUrl.includes('.')) {
      const arr = req.path.split('/');
      const file = arr[arr.length - 1];
      const type = file.split('.')[1];
      if (type)
        proxyRes.headers[
          'content-disposition'
        ] = `attachment; filename="${file}"`;
      if (req.filename)
        proxyRes.headers[
          'content-disposition'
        ] = `attachment; filename="${req.filename}"`;
    }
    // proxyRes.headers["content-disposition"] = 'attachment; filename="definition.csv"'
    // proxyRes.type("csv")
    // proxyRes.attachment("aaaa.csv")
    // console.log(res.headers)
    // proxyRes.headers[""] = res.headers;     // add new header to response
    // delete proxyRes.headers['x-removed'];       // remove header from response
  },
});

router.get('/host', (req, res) => {
  console.log(req.query.id);
  redis.hget(`project:${req.query.id}`, `host`).then(url => {
    res.json(url);
  });
});

router.use('/*', getHost, hpm);

export default router;
