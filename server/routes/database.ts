import wss from '../webSocket';
import axios from 'axios';
import uuid from 'uuid/v4'
import config from '../../config';
import { DatabaseConfig, checks, uploads, oracleUpload } from './databases'
const esServicePath = config.services.ETL_SERVICE;

wss.register('checkDatabase', async (message = {}) => {
  const databaseConfig: DatabaseConfig = {
    type: message.databaseType,
    host: message.sqlHostName,
    port: parseInt(message.sqlPort),
    user: message.sqlUserName,
    password: message.sqlPassword,
    database: message.sqlDatabase,
    table: message.sqlTable,
    sql: message.sqlQueryStr,
    encode: message.sqlEncoding,
  };
  try {
    await checks[`${databaseConfig.type}Check`](databaseConfig)
    return { status: 200, message: 'ok' }
  } catch (e) {
    const error = e && e.response && e.response.data ? e.response.data : e
    return {
      status: 500,
      message: typeof error === 'string' ? error : 'database check failed. please check your database connection information',
      error
    }
  }
});

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
    encode: message.sqlEncoding,
  };

  const indexResponse = await axios.get(`${esServicePath}/etls/createIndex`);
  if (indexResponse.data.status !== 200) return indexResponse.data;
  const index = indexResponse.data.index;
  const opaqueId = uuid()
  if (databaseConfig.type === 'oracle') {
    try {
      for await (let count of oracleUpload(index, databaseConfig, opaqueId)) {
        if (Array.isArray(count)) return {
          status: 200,
          message: 'ok',
          originalIndex: index,
          rawHeader: count
        }
        else progress({ count })
      }
    } catch (error) {
      if (error.status === 400) return error
      return {
        status: 400,
        message: 'database check failed. please check your database connection information',
        error
      }
    }
  } else {
    const { rawHeader } = await uploads[`${databaseConfig.type}Upload`](index, databaseConfig, opaqueId)
    return new Promise((resolve, reject) => {
      let emptyCount = 0;
      const interval = setInterval(async () => {
        const countReponse = await axios.get(
          `${esServicePath}/etls/${index}/count`,
        );
        if (countReponse.data.status === 200)
          progress({ count: countReponse.data.count });
        const { data } = await axios.get(
          `${esServicePath}/etls/getTaskByOpaqueId/${opaqueId}`,
        );
        if (data.task) emptyCount = 0;
        else {
          emptyCount++;
          // console.log(emptyCount, countReponse.data.count)
          if (emptyCount > 10) {
            clearInterval(interval);
            // await redis.incrby(`user:${userId}:upload`, parseInt(size))
            resolve({
              status: 200,
              message: 'ok',
              originalIndex: index,
              rawHeader,
            });
          }
        }
      }, 1000);
    })
  }
  // const uploadResponse = await axios.post(
  //   `${esServicePath}/etls/database/${index}/upload`,
  //   databaseConfig,
  // );
  // if (uploadResponse.data.status !== 200) return uploadResponse.data;
  // const rawHeader = uploadResponse.data.rawHeader;
  // const opaqueId = uploadResponse.data.opaqueId;

  ;
});

export default {};
