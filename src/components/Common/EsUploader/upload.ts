import axios, { AxiosResponse } from 'axios'
import papa from 'papaparse'

const chunkSize = 1 * 1024 * 1024
// const chunkSize = 100 * 1024
const concurrent = 4

export default function EsUploader(file, option:any = {}) {
  let index = false
  let hasNextChunk = true
  let isPause = false
  let processors: any[] = []
  let chunk: any[] = []
  let header: any = false
  let chunkPromise: any = null
  let chunkPromiseResolve: any = null
  let uploader: any = null
  let uploaded = 0
  let currentCursor = 0
  let no = 0

  const { onProgress = () => {}, onError = () => {}, onFinished = () => {} } =
    option

  chunkPromise = new Promise((resolve, reject) => chunkPromiseResolve = resolve)

  papa.parse(file, {
    step: async (result, parser) => {
      currentCursor = result.meta.cursor
      if(!header) {
        header = result.data[0]
        uploader = parser
        return
      }

      result.data[0].unshift(no++)
      chunk.push(result.data[0])
      if(currentCursor >= chunkSize) {
        parser.pause()
        chunkPromiseResolve()
      }
    },
    complete: async () => {
      chunkPromiseResolve()
      hasNextChunk = false
    }
  })

  const createIndex = async () => {
    const { data } = await axios.get('/etls/createIndex')
    const { index: dataIndex } = data
    index = dataIndex
  }

  const start = async () => {
    await createIndex()
    await chunkPromise
    while (processors.length < concurrent && hasNextChunk) await uploadChunk()

    continuedUpload()
  }

  const continuedUpload = async () => {
    while (hasNextChunk && !isPause) {
      const { promise, response } = await Promise.race(processors)
      uploaded += promise.bytes
      onProgress(`${uploaded}/${file.size}`)
      processors.splice(promise.no, 1)
      processors.forEach((p, i) => p.no = i )
      await uploadChunk()
    }
    if(chunk.length > 0) await uploadChunk()
    while ( processors.length > 0 ) {
      const { promise, response } = await Promise.race(processors)
      uploaded += promise.bytes
      onProgress(`${uploaded}/${file.size}`)
      processors.splice(promise.no, 1)
      processors.forEach((p, i) => p.no = i )
    }
    // const _header = header.map( (k, i) => i.toString() )
    onFinished({
      originalIndex: index,
      totalRawLines: no,
      rawHeader: header,
      fileName: file.name
    }, file)
  }

  const uploadChunk = async () => {
    const chunk = await getNextChunk()
    const requestPromise: any = axios.request({
      url: `/etls/${index}/upload`,
      headers: {
        'Content-Type': "text/plain",
      },
      method: "POST",
      data: chunk.data
    }).then((response) => ({promise: requestPromise, response}))
    requestPromise.no = processors.length
    requestPromise.bytes = chunk.bytes
    processors.push(requestPromise)
  }

  const getNextChunk = async () => {
    const _header = header.map( (k, i) => i )
    _header.unshift('__no')
    chunk.unshift(_header)
    const csvChunk = papa.unparse(chunk)
    chunk = []
    if(!hasNextChunk) return {bytes: currentCursor, data: csvChunk}
    chunkPromise = new Promise((resolve, reject) => chunkPromiseResolve =
      resolve)
    const bytes = currentCursor
    uploader.resume()
    await chunkPromise
    return {bytes, data: csvChunk}
  }

  const resume = async () => {
    isPause = false
    continuedUpload()
  }

  const pause = async () => {
    isPause = true
  }

  const abort = async () => {
    isPause = true
  }

  start()

  return { resume, pause, abort }
}
