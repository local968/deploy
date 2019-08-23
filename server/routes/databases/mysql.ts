import mysql from 'mysql';
import axios from 'axios'
import Papa from 'papaparse'
import config from '../../../config';
import { DatabaseConfig } from './index';

const esServicePath = config.services.ETL_SERVICE;
const path = process.env.ES_URI

const uploadCsv = async (csv: string, index: string, opaqueId: string) => await axios.request({
  url: `${esServicePath}/etls/${index}/upload?opaqueId=${opaqueId}`,
  headers: {
    'Content-Type': "text/plain",
  },
  method: "POST",
  data: csv,
})

export const mysqlCheck = async (setting: DatabaseConfig): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const connection = mysql.createConnection(setting)
    connection.connect((error) => {
      if (error) reject(error)
      connection.query('SELECT 1 + 1 AS solution', (error, result, fields) => {
        if (error) reject(error)
        resolve()
        connection.end();
      })
    })
  })
}

export const mysqlUpload = async function* (index: string, setting: DatabaseConfig, opaqueId: string) {
  const connection = mysql.createConnection(setting)
  let rawHeader: string[] = []
  let chunk: any[] = []
  let isEnd = false
  let isPaused = false
  const uploadChunk = async function* () {
    const csv = Papa.unparse(chunk)
    for (let uploadErrorTimes = 0; uploadErrorTimes < 10;) {
      try {
        const uploadResponse = await uploadCsv(csv, index, opaqueId)
        if (uploadResponse.status !== 200 || uploadResponse.data.status !== 200) throw { status: 400, message: 'upload failed', error: uploadResponse.data }
        break
      } catch (error) {
        console.error(error)
        uploadErrorTimes++
        if (uploadErrorTimes >= 8) throw { status: 400, message: 'exceed max upload try times.', error: 'exceed max upload try times.' }
      }
    }
    yield no
    chunk = []
    connection.resume()
    isPaused = false
  }
  await new Promise((resolve, reject) => {
    connection.connect((error) => {
      if (error) console.error(error)
      if (error) reject({ status: 400, message: 'database connect error', error })
      resolve()
    })
  })

  const query = connection.query(setting.sql || `SELECT * from ${setting.table}`)
  let no = 0
  let connectionError
  query.on('error', (error) => {
    // console.error({ status: 400, message: 'database query error', error })
    connectionError = { status: 400, message: error.toString() || 'database query error', error }
  })
  query.on('result', async (row: any) => {
    if (rawHeader.length === 0) {
      rawHeader = Object.keys(row)
      if (setting.mapHeader) rawHeader = setting.mapHeader.concat(rawHeader.filter(h => setting.mapHeader.indexOf(h) === -1))
    }
    row = Object.keys(row).reduce((prev, curr: string) => {
      if (row[curr] && row[curr] !== '') prev[rawHeader.indexOf(curr)] = row[curr]
      return prev
    }, ({} as any))
    row.__no = no++
    chunk.push(row)
    if (chunk.length >= 100) {
      connection.pause()
      isPaused = true
    }
  })
    .on('end', async () => {
      isEnd = true
    })

  for (; ;) {
    if (connectionError) throw connectionError
    if (isEnd) {
      yield rawHeader
      break;
    }
    if (!isPaused) await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    else yield* await uploadChunk()
  }

  connection.end();
}
