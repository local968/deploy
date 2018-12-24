const { Router } = require('express')
const user = require('./user')
const upload = require('./upload')
const redirect = require('./redirect')
const api = require('./api')
require('./project')
require('./deployment')
require('./database')

const router = new Router()

router.use('/user', user)
router.use('/upload', upload)
router.use('/redirect', redirect)
router.use('/api', api)

module.exports = router
