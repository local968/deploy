import axios from 'axios'
import { DatabaseConfig } from './index'
import qs from 'querystring'
import Papa from 'papaparse'
// import { addOpaqueId, removeOpaqueId } from '../index'

const eeeService = process.env.EEE_SERVICE

const removeHiveDot = (data: any) => {
  return Object.entries(data).reduce((prev, [key, value]) => {
    const arr = key.split('.')
    if (arr.length > 0) prev[arr[arr.length - 1]] = value
    return prev
  }, {} as any)
}

const jdbcDownload = async (setting: DatabaseConfig, start: number = 0): Promise<string> => {
  let url
  let sql = setting.sql || `SELECT * FROM ${setting.table}`
  if (sql.indexOf('LIMIT') === -1) sql += ` LIMIT ${start},5000`
  if (setting.type === 'oracle') {
    url = `jdbc:oracle:thin:@${setting.host}:${setting.port}:${setting.database}`
    sql = setting.sql || `SELECT * from ( select m.*, rownum r from "${setting.table}" m) where r >= ${start} and r <= ${start + 5000}`
  } else if (setting.type === 'hive') {
    url = `jdbc:hive2://${setting.host}:${setting.port}/${setting.database}`
  }
  const requestBody = {
    url,
    sql,
    "user": setting.user,
    "password": setting.password
  }
  const { data } = await axios.request({
    url: `${eeeService}/elts/records/${setting.type}?${qs.stringify(requestBody)}`,
    method: 'get',
    headers: { 'content-type': 'application/json' }
  })
  return data.toString().slice(0, -1)
}

const jdbcFetchHeader = async (setting: DatabaseConfig): Promise<string[]> => {
  let url
  let sql = setting.sql || `SELECT * FROM ${setting.table}`
  if (sql.indexOf('LIMIT') === -1) sql += ` LIMIT 0,1`
  if (setting.type === 'oracle') {
    url = `jdbc:oracle:thin:@${setting.host}:${setting.port}:${setting.database}`
    sql = setting.sql || `SELECT * from ( select m.*, rownum r from "${setting.table}" m) where r >= 0 and r <= 1`
  } else if (setting.type === 'hive') {
    url = `jdbc:hive2://${setting.host}:${setting.port}/${setting.database}`
  }
  const requestBody = {
    url,
    sql,
    "user": setting.user,
    "password": setting.password
  }
  const { data } = await axios.request({
    url: `${eeeService}/elts/records/${setting.type}?${qs.stringify(requestBody)}`,
    method: 'get',
    headers: { 'content-type': 'application/json' }
  })
  return data.toString().split('\n')[0].split(',').map((key: string) => key.indexOf('.') === -1 ? key : key.split('.')[1])
}

export const hiveCheck = async (setting: DatabaseConfig) => {
  const body = {
    "url": `jdbc:hive2://${setting.host}:${setting.port}/${setting.database}`,
    // "sql": setting.sql || `SELECT * FROM ${setting.table}`,
    "sql": 'SELECT 1 + 1 AS solution',
    // "sql": "SELECT * FROM src",
    "user": setting.user,
    "password": setting.password
  }
  const url = `${eeeService}/elts/records/hive?${qs.stringify(body)}`
  await axios.get(url)
  return
}

export const hiveUpload = async (index: string, setting: DatabaseConfig, opaqueId: string): Promise<{ status: number, message: string, rawHeader: string[], error?: any }> => {
  const rawHeader = await startUpload(index, setting, opaqueId)
  return { status: 200, message: 'ok', rawHeader }
}

const startUpload = async (index: string, setting: DatabaseConfig, opaqueId: string): Promise<string[]> => {
  let no = 0
  let prevNo = 1
  // addOpaqueId(opaqueId)
  return new Promise<string[]>(async (resolve, reject) => {
    try {
      let rawHeader = await jdbcFetchHeader(setting)
      if (setting.mapHeader) rawHeader = setting.mapHeader.concat(rawHeader.filter(h => setting.mapHeader.indexOf(h) === -1))
      resolve(rawHeader)
      while (prevNo !== no) {
        prevNo = no
        const data = await jdbcDownload(setting, no)
        const result = Papa.parse(data, { header: true }).data
        const finalData = result.map(row => {
          row = removeHiveDot(row)
          const newRow: any = {}
          Object.keys(row).forEach(key => newRow[rawHeader.indexOf(key).toString()] = row[key])
          newRow.__no = no++
          return newRow
        })
        if (finalData.length > 0) {
          const csv = Papa.unparse(finalData)
          const uploadResponse = await axios.request({
            url: `http://localhost:${process.env.PORT}/etls/${index}/upload?opaqueId=${opaqueId}`,
            headers: {
              'Content-Type': "text/plain",
            },
            method: "POST",
            data: csv,
          })
          if (uploadResponse.status !== 200 || uploadResponse.data.status !== 200) throw { status: 500, message: 'upload failed' }
        }
      }
      // removeOpaqueId(opaqueId)
    } catch (e) {
      console.error(e)
      // removeOpaqueId(opaqueId)
    }
  })
}
