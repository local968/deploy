const { redis, pubsub } = require('redis')
const wss = require('../webSocket')
const uuid = require('uuid')
const moment = require('moment')

wss.register('searchDeployment', (message, socket) => {
  return { list: [] }
})

wss.register('watchDeployment', (message, socket) => {

})

wss.register('addDeployment', (message, socket) => {

})

wss.register('deploySchedule', (message, socket) => {

})

wss.register('suspendDeployment', (message, socket) => {

})

wss.register('removeDeployment', (message, socket) => {

})

wss.register('updateDeployment', (message, socket) => {

})
