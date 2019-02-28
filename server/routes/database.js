const wss = require('../webSocket')
const command = require('../command')
const uuid = require('uuid')
const { redis } = require('redis')
const moment = require('moment')
const { userModelingRestriction, userStorageRestriction } = require('restriction')

wss.register('checkDatabase', (message, socket, progress) => command({
  ...message,
  requestId: message._id,
  command: 'sqlData',
  test: true,
  userId: socket.session.userId
}, (result) => (result.status < 0 || result.status === 100) ? result : progress(result)))

wss.register('downloadFromDatabase', (message, socket, progress) => {
  const {type} = message
  const {userId} = socket.session
  return command({
    ...message,
    requestId: message._id,
    command: 'sqlData',
    userId
  }, (result) => (result.status < 0 || result.status === 100) ? result : progress(result))
    .then(async resp => {
      if(resp.result['process error']) return {
        status: 420,
        message: resp.result.msg,
        error: resp.result['process error']
      }
      const path = resp.result.csvLocation
      const name = resp.result.filename
      const size = resp.result.size.toString()
      const lineCount = resp.result.totalLines
      if (!path) throw new Error('no path')
      if (type === 'modeling' && parseInt(size) >= userModelingRestriction[socket.session.user.level]) return {
        status: 416,
        message: 'Your usage of modeling data size has reached the max restricted by your current license.',
        error: 'modeling file too large'
      }
      const previewSize = await redis.get(`user:${userId}:upload`)
      if (parseInt(previewSize) + parseInt(size) >= userStorageRestriction[socket.session.user.level]) return {
        status: 417,
        message: 'Your usage of storage space has reached the max restricted by your current license.',
        error: 'storage space full'
      }
      const fileId = uuid.v4()
      await redis.set('file:' + fileId, JSON.stringify({
        name,
        content_type: "application/octet-stream",
        path,
        md5: '',
        size,
        from: 'sql',
        type,
        createdTime: moment().unix(),
        lineCount,
        userId,
        message
      }))
      await redis.incrby(`user:${userId}:upload`, parseInt(size))
      return { fileId, status: 200, message: 'ok' }
    })
})
