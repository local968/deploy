const { Router } = require('express')
const user = require('./user')
const upload = require('./upload')
const redirect = require('./redirect')
require('./project')
require('./deployment')

const router = new Router()

router.use('/user', user)
router.use('/upload', upload)
router.use('/redirect', redirect)

module.exports = router
