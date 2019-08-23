import axios from 'axios'
import Papa from 'papaparse'
import { DatabaseConfig } from './index'
import http from 'http'
import querystring from 'querystring';
import config from '../../../config';
const esServicePath = config.services.ETL_SERVICE;
const REQUEST_START = '1'
const REQUEST_CONTINUE = '2'
const R2LEARN_API = config.services.R2LEARN_API

export const oracleCheck = async (setting: DatabaseConfig) => {
  const pythonSetting = {
    "sql_user_name": setting.user,
    "sql_password": setting.password,
    "sql_host_name": setting.host,
    "sql_port": setting.port,
    "sql_database": setting.database,
    "sql_query_str": 'SELECT 1 FROM DUAL',
    "sql_table": setting.table
  }
  await new Promise((resolve, reject) => {
    const request = http.request(`${R2LEARN_API}/sql/oracle?` + querystring.stringify(pythonSetting), {
      method: 'post'
    }, (res) => {
      res.on('data', async (d: Buffer) => {
        const data = d.toString('utf8')
        if (data === '1\n\n') resolve()
        else reject(data)
      })
      res.on('error', (err) => {
        reject(err)
        console.error('check res error:', err)
      })
    })
    request.end(REQUEST_START)
    request.on('error', (err) => {
      reject(err)
      console.error('check req error:', err)
    })
  })
  return
}

const fetchToken = async (setting: DatabaseConfig) => {
  const pythonSetting = {
    "sql_user_name": setting.user,
    "sql_password": setting.password,
    "sql_host_name": setting.host,
    "sql_port": setting.port,
    "sql_database": setting.database,
    "sql_query_str": setting.sql || '',
    "sql_table": setting.table,
  }
  const response = await axios.get(`${R2LEARN_API}/sql/oracleQuery?` + querystring.stringify(pythonSetting))
  if (response.status === 200) return response.data
  else throw { error: response.data, message: response.data, status: response.status }
}

const fetchOracleData = async function (token): Promise<string> {
  const url = `${R2LEARN_API}/sql/oracleQuery?token=${token}`
  const response = await axios.get(url)
  if (response.data.length === 0) return ''
  if (response.status !== 200 || response.data.startsWith('__error')) {
    const error = response.data.substr(8)
    const message = error
    throw { status: 400, message, error }
  }
  return response.data
}

const uploadCsv = async (csv: string, index: string, opaqueId: string) => await axios.request({

  url: `${esServicePath}/etls/${index}/upload?opaqueId=${opaqueId}`,
  headers: {
    'Content-Type': "text/plain",
  },
  method: "POST",
  data: csv,
})

export const oracleUpload = async function* (index: string, setting: DatabaseConfig, opaqueId: string) {
  const token = await fetchToken(setting)
  const mapHeader: string[] = setting.mapHeader
  const headerData = await fetchOracleData(token)
  let no = 0
  let header: string[] = headerData.substr(0, headerData.length - 2).split(',')
  if (mapHeader) header = mapHeader.concat(header.filter(h => mapHeader.indexOf(h) === -1))
  for (let times = 0; times < 5;) {
    try {
      for (let chunk = await fetchOracleData(token); chunk.length > 0; chunk = await fetchOracleData(token)) {
        chunk = header.join(',') + '\n' + chunk.substr(0, chunk.length - 2)
        const result = Papa.parse(chunk, { header: true }).data
        const finalData = result.map(row => {
          const newRow: any = {}
          Object.keys(row).forEach(key => newRow[header.indexOf(key).toString()] = row[key])
          newRow.__no = no++
          return newRow
        })
        const csv = Papa.unparse(finalData)
        for (let uploadErrorTimes = 0; uploadErrorTimes < 10;) {
          try {
            const uploadResponse = await uploadCsv(csv, index, opaqueId)
            yield no
            if (uploadResponse.status !== 200 || uploadResponse.data.status !== 200) throw { status: 400, message: 'upload failed', error: uploadResponse.data }
            times = 0
            break
          } catch (error) {
            console.error(error)
            uploadErrorTimes++
            if (uploadErrorTimes >= 8) throw { status: 400, message: 'exceed max upload try times.', error: 'exceed max upload try times.' }
          }
        }
      }
      yield header
      // for of ignore return value
      return
    } catch (error) {
      if (error.status && error.status === 400) throw error
      times++
    }
  }
  throw { status: 400, message: 'exceed max retry times', error: 'exceed max retry times' }
}
