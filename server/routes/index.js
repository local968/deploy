const { Router } = require('express')
const user = require('./user')
const upload = require('./upload')
require('./project')
require('./deployment')

const router = new Router()

router.use('/user', user)
router.use('/upload', upload)

module.exports = router
