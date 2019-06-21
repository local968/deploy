const wss = require('../webSocket')
const command = require('../command')
const uuid = require('uuid')
const { redis } = require('redis')
const moment = require('moment')
const axios = require('axios')
const config = require('config')
const { userModelingRestriction, userStorageRestriction } = require('restriction')
const esServicePath = config.services.ETL_SERVICE; //'http://localhost:8000'

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
  try {
    const { data } = await axios.post(`${esServicePath}/etls/database/check`, databaseConfig)
    return data
  } catch (e) {
    console.error(e)
    return {
      status: 500,
      message: 'Database check failed. Please check your database connection information'
    }
  }

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

  const indexResponse = await axios.get(`${esServicePath}/etls/createIndex`)
  if (indexResponse.data.status !== 200) return indexResponse.data
  const index = indexResponse.data.index

  const uploadResponse = await axios.post(`${esServicePath}/etls/database/${index}/upload`, databaseConfig)
  if (uploadResponse.data.status !== 200) return uploadResponse.data
  const rawHeader = uploadResponse.data.rawHeader
  const opaqueId = uploadResponse.data.opaqueId

  return await new Promise((resolve, reject) => {
    let emptyCount = 0
    const interval = setInterval(async () => {
      const countReponse = await axios.get(`${esServicePath}/etls/${index}/count`)
      if (countReponse.data.status === 200) progress({ count: countReponse.data.count })
      const { data } = await axios.get(`${esServicePath}/etls/getTaskByOpaqueId/${opaqueId}`)
      if (data.task) emptyCount = 0
      else {
        emptyCount++
        // console.log(emptyCount, countReponse.data.count)
        if (emptyCount > 10) {
          clearInterval(interval)
          // await redis.incrby(`user:${userId}:upload`, parseInt(size))
          resolve({
            status: 200,
            message: 'ok',
            originalIndex: index,
            rawHeader
          })
        }
      }
    }, 1000)
  })
})

