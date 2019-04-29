const { Router } = require('express')
const user = require('./user')
const upload = require('./upload')
const redirect = require('./redirect')
const redirectEs = require('./redirectEs')
const api = require('./api')
require('./project')
require('./deployment')
require('./database')
require('./etl')

const router = new Router()

router.use('/user', user)
router.use('/upload', upload)
router.use('/redirect', redirect)
router.use('/etls', redirectEs)
router.use('/api', api)

module.exports = router
