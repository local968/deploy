const wss = require('../webSocket')
const command = require('../command')
const uuid = require('uuid')
const { redis } = require('redis')
const moment = require('moment')
const axios = require('axios')
const config = require('config')
const { userModelingRestriction, userStorageRestriction } = require('restriction')
const esServicePath = config.services.ETL_SERVICE; //'http://localhost:8000'

// wss.register('checkDatabase', (message, socket, progress) => command({
//   ...message,
//   requestId: message._id,
//   command: 'sqlData',
//   test: true,
//   userId: socket.session.userId
// }, (result) => (result.status < 0 || result.status === 100) ? result : progress(result)))

wss.register('checkDatabase', async (message, socket, progress) => {
  const databaseConfig = {
    type: message.databaseType,
    host: message.sqlHostName,
    port: parseInt(message.sqlPort),
    user: message.sqlUserName,
    password: message.sqlPassword,
    database: message.sqlDatabase,
    table: message.sqlTable,
    sql: message.sqlQueryStr,
    encode: message.sqlEncoding
  }
  return await axios.post(`${esServicePath}/etls/database/check`, databaseConfig)
})

wss.register('downloadFromDatabase', async (message, socket, progress) => {
  const databaseConfig = {
    type: message.databaseType,
    host: message.sqlHostName,
    port: parseInt(message.sqlPort),
    user: message.sqlUserName,
    password: message.sqlPassword,
    database: message.sqlDatabase,
    table: message.sqlTable,
    sql: message.sqlQueryStr,
    encode: message.sqlEncoding
  }

  // if (type === 'modeling' && parseInt(size) >= userModelingRestriction[socket.session.user.level]) return {
  //   status: 416,
  //   message: 'Your usage of modeling data size has reached the max restricted by your current license.',
  //   error: 'modeling file too large'
  // }
  // const previewSize = await redis.get(`user:${userId}:upload`)
  // if (parseInt(previewSize) + parseInt(size) >= userStorageRestriction[socket.session.user.level]) return {
  //   status: 417,
  //   message: 'Your usage of storage space has reached the max restricted by your current license.',
  //   error: 'storage space full'
  // }

  const indexResponse = await axios.get(`${esServicePath}/etls/createIndex`)
  if (indexResponse.data.status !== 200) return indexResponse.data
  const index = indexResponse.data.index

  const uploadResponse = await axios.post(`${esServicePath}/etls/database/${index}/upload`, databaseConfig)
  if (uploadResponse.data.status !== 200) return uploadResponse.data
  const opaqueId = uploadResponse.data.opaqueId

  return new Promise((resolve, reject) => {
    let emptyCount = 0
    const interval = setInterval(async () => {
      const countReponse = await axios.get(`${esServicePath}/etls/${index}/count`)
      if (countReponse.data.status === 200) progress({ count: countReponse.data.count })
      const { data } = await axios.get(`${esServicePath}/etls/getTaskByOpaqueId/${opaqueId}`)
      if (data.task) emptyCount = 0
      else {
        emptyCount++
        if (emptyCount >= 5) {
          clearInterval(interval)
          // await redis.incrby(`user:${userId}:upload`, parseInt(size))
          resolve({
            status: 200,
            message: 'ok',
            index
          })
        }
      }
    }, 1000)
  })
})

// wss.register('downloadFromDatabase', (message, socket, progress) => {
//   const { type } = message
//   const { userId } = socket.session
//   return command({
//     ...message,
//     requestId: message._id,
//     command: 'sqlData',
//     userId
//   }, (result) => (result.status < 0 || result.status === 100) ? result : progress(result))
//     .then(async resp => {
//       if (resp.result['process error']) return {
//         status: 420,
//         message: resp.result.msg,
//         error: resp.result['process error']
//       }
//       const path = resp.result.csvLocation
//       const name = resp.result.filename
//       const size = resp.result.size.toString()
//       const lineCount = resp.result.totalLines
//       if (!path) throw new Error('no path')
//       if (type === 'modeling' && parseInt(size) >= userModelingRestriction[socket.session.user.level]) return {
//         status: 416,
//         message: 'Your usage of modeling data size has reached the max restricted by your current license.',
//         error: 'modeling file too large'
//       }
//       const previewSize = await redis.get(`user:${userId}:upload`)
//       if (parseInt(previewSize) + parseInt(size) >= userStorageRestriction[socket.session.user.level]) return {
//         status: 417,
//         message: 'Your usage of storage space has reached the max restricted by your current license.',
//         error: 'storage space full'
//       }
//       const fileId = uuid.v4()
//       await redis.set('file:' + fileId, JSON.stringify({
//         name,
//         content_type: "application/octet-stream",
//         path,
//         md5: '',
//         size,
//         from: 'sql',
//         type,
//         createdTime: moment().unix(),
//         lineCount,
//         userId,
//         message
//       }))
//       await redis.incrby(`user:${userId}:upload`, parseInt(size))
//       return { fileId, status: 200, message: 'ok' }
//     })
// })
