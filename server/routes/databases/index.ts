import { Router } from 'express'
// import { config } from 'dotenv';
// import { join } from 'path';
import uuid from 'uuid/v4'
import { mysqlCheck, mysqlUpload } from './mysql'
import { hiveCheck, hiveUpload } from './hive'
import { oracleCheck } from './oracle'
export { oracleUpload } from './oracle'

const REQUEST_START = '1'
const REQUEST_CONTINUE = '2'
export interface DatabaseConfig {
  type: 'mysql' | 'oracle' | 'hive',
  host: string,
  user: string,
  password: string,
  database: string,
  table: string,
  sql?: string,
  port: number,
  encode?: 'utf8' | 'gb2312',
  mapHeader?: string[]
}

// config({ path: join(__dirname, '../.env') });

const router = Router()

export const uploads: { [x: string]: (index: string, setting: DatabaseConfig, opaqueId: string) => Promise<{ status: number, message: string, rawHeader: string[], error?: any }> } = { mysqlUpload, hiveUpload }

export const checks: { [x: string]: (setting: DatabaseConfig) => Promise<void> } = { mysqlCheck, oracleCheck, hiveCheck }

router.post('/check', async (req, res) => {
  try {
    const databaseConfig: DatabaseConfig = req.body
    await checks[`${databaseConfig.type}Check`](databaseConfig)
    res.json({ status: 200, message: 'ok' })
  } catch (e) {
    const error = e && e.response && e.response.data ? e.response.data : e
    res.json({
      status: 500,
      message: typeof error === 'string' ? error : 'Database check failed. Please check your database connection information',
      error
    })
  }
})

router.post('/:index/upload', async (req, res) => {
  const databaseConfig: DatabaseConfig = req.body
  try {
    const opaqueId = uuid()
    console.log('database uploading')
    const { rawHeader } = await uploads[`${databaseConfig.type}Upload`](req.params.index, databaseConfig, opaqueId)
    res.json({ status: 200, message: 'ok', opaqueId, rawHeader })
  } catch (e) {
    const error = e && e.response && e.response.data ? e.response.data : e
    res.json({
      status: 500,
      message: typeof error === 'string' ? error : 'Upload from database failed, please check your database config',
      error
    })
  }
})

export default router

// {
//   type: 'mysql',
//   host: 'app1.r2ai.com.cn',
//   port: '1521,
//   user: 'root',
//   password: 'b0532cc95a73',
//   database: 'demo',
//   table: 'dma1c_train',
//   sql: 'SELECT * FROM dma1c_train',
//   encode: 'utf8'
// }

// databaseType:"oracle"
// sqlDatabase:"EE.oracle.docker"
// sqlEncoding:"utf8"
// sqlHostName:"192.168.0.23"
// sqlPassword:"oracle"
// sqlPort:"1521"
// sqlQueryStr:"select * from "test_1wx100_classifi""
// sqlTable:"bank.train"
// sqlUserName:"system"
