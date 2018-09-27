const { Router } = require('express')
const user = require('./user')

const router = new Router()

router.use('/user', user)

module.exports = router
