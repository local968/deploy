const { Router } = require('express')
const { redis } = require('redis')
const proxy = require('http-proxy-middleware')

const router = new Router()

const getHost = (req, res, next) => {
  const { query, body } = req;

  const projectId = query.projectId || body.projectId
  if (!projectId) {
    res.send({
      status: 430,
      message: "projectId empty",
      error: "projectId empty"
    })
    return
  }
  redis.hget("project:" + projectId, "host").then(url => {
    req.proxyHost = JSON.parse(url)
    next()
  })
}

const hpm = proxy({
  target: 'http://127.0.0.1',
  pathRewrite: {
    '^/redirect/*': "/"
  },
  router: req => {
    return "http://" + req.proxyHost
  },
  onProxyRes: (proxyRes, req, res) => {
    const header = {...proxyRes.headers}
    delete header.connection
    res.headers = header
    // proxyRes.headers[""] = res.headers;     // add new header to response
    // delete proxyRes.headers['x-removed'];       // remove header from response
}
})

router.use("/*", getHost, hpm)

module.exports = router
