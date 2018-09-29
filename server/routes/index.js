const { Router } = require('express')
const user = require('./user')
require('./project')
require('./deployment')

const router = new Router()

router.use('/user', user)

module.exports = router
