import mysql from 'mysql';
import axios from 'axios'
import { DatabaseConfig } from './index';

const path = process.env.ES_URI

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

export const mysqlUpload = async (index: string, setting: DatabaseConfig, opaqueId: string): Promise<{ status: number, message: string, rawHeader: string[], error?: any }> => {
  const action = { index: { _index: index } }
  let body: string[] = []
  let rawHeader: string[] = []
  return await new Promise<{ status: number, message: string, rawHeader: string[], error?: any }>((resolve, reject) => {
    const connection = mysql.createConnection(setting)
    connection.connect((error) => {
      if (error) reject(error)
    })

    const query = connection.query(setting.sql || `SELECT * from ${setting.table}`)
    let no = 0
    query
      .on('error', (error) => {
        console.error({ status: 500, message: 'database error', error })
        reject({ status: 500, message: 'database error', error })
      })
      .on('result', async (row: any) => {
        if (rawHeader.length === 0) {
          rawHeader = Object.keys(row)
          if (setting.mapHeader) rawHeader = setting.mapHeader.concat(rawHeader.filter(h => setting.mapHeader.indexOf(h) === -1))
        }
        row = Object.keys(row).reduce((prev, curr: string) => {
          if (row[curr] && row[curr] !== '') prev[rawHeader.indexOf(curr)] = row[curr]
          return prev
        }, ({} as any))
        row.__no = no
        body.push(JSON.stringify(action))
        body.push(JSON.stringify(row))
        no++
        if (body.length >= 1000) {
          connection.pause()
          try {
            const response = await axios.post(path + '_bulk?filter_path=errors,took&refresh', body.join('\n') + '\n', {
              headers: { 'content-type': 'application/json', 'X-Opaque-Id': opaqueId },
              maxContentLength: 100 * 1024 * 1024
            })
            resolve({ status: 200, message: 'ok', rawHeader })
            // res.send({ status: 200, message: 'ok', data: response.data })
            if (response.data.errors && response.data.errors > 0) reject(response)
            body = []
            connection.resume()
          } catch (error) {
            console.error({ status: 500, message: 'upload data from database error', error })
            reject({ status: 500, message: 'upload data from database error', error })
            console.log(error)
          }
        }
        // console.log(row)
        // connection.pause()
      })
      .on('end', async () => {
        try {
          if (body.length === 0) return
          const response = await axios.post(path + '_bulk?filter_path=errors,took&refresh', body.join('\n') + '\n', {
            headers: { 'content-type': 'application/json' },
            maxContentLength: 100 * 1024 * 1024
          })
          // res.send({ status: 200, message: 'ok', data: response.data })
          if (response.data.errors && response.data.errors > 0) reject(response)
        } catch (error) {
          console.error({ status: 500, message: 'upload data from database error(end)', error })
          reject({ status: 500, message: 'upload data from database error(end)', error })
        }
      })

    connection.end();
  })
}