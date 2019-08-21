import axios from 'axios'
import papa from 'papaparse'

const chunkSize = 1 * 1024 * 1024
// const chunkSize = 1 * 1024
const concurrent = 4

const test = false

const autoFixHeader = (mapHeader) => {
  const temp: any = {};
  const header = mapHeader.map((h, i) => {
    h = h.trim();
    if (/^$/.test(h)) {
      h = `Unnamed: ${i}`;
    }
    if (!temp[h]) {
      temp[h] = 1;
    } else {
      h = h + '.' + temp[h];
      temp[h]++;
    }
    return h;
  });

  return header
}

export default function EsUploader(file, option: any = {}) {
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

  const { onProgress = () => { }, onError = () => { }, onFinished = () => { }, afterClose = (index) => { },
    charset = 'utf-8' } =
    option

  chunkPromise = new Promise((resolve, reject) => chunkPromiseResolve = resolve)

  papa.parse(file, {
    // @ts-ignore
    chunkSize,
    skipEmptyLines: true,
    encoding: charset,
    chunk: async (result, parser) => {
      uploaded += papa.unparse(result.data).length
      if (!header) {
        header = result.data[0]
        header.unshift('__no')
        result.data = result.data.slice(1)
        uploader = parser
      }
      chunk = result.data.map(row => [no++, ...row])
      parser.pause()
      chunkPromiseResolve()
    },
    complete: async () => {
      chunkPromiseResolve()
      hasNextChunk = false
    }
  })

  const createIndex = async () => {
    if (!test) {
      const { data } = await axios.get('/etls/createIndex')
      const { index: dataIndex } = data
      index = dataIndex
    } else {
      index = test
    }
  }

  const start = async () => {
    await createIndex()
    await chunkPromise
    while (processors.length < concurrent && hasNextChunk) await uploadChunk()

    continuedUpload()
  }

  const handleChunkDOne = async () => {
    const { promise, response: { data } } = await Promise.race(processors)
    if (isPause) return
    const { status, message } = data
    if (status !== 200) {
      isPause = true
      onError(new Error(message))
      return
    }
    // uploaded += promise.bytes
    onProgress(`${uploaded > file.size ? file.size : uploaded}/${file.size}`)
    processors.splice(promise.no, 1)
    processors.forEach((p, i) => p.no = i)
  }

  const continuedUpload = async () => {
    while (hasNextChunk && !isPause) {
      await handleChunkDOne()
      await uploadChunk()
    }
    if (isPause) return
    if (chunk.length > 0) await uploadChunk()
    while (processors.length > 0) {
      await handleChunkDOne()
    }
    const rawHeader = option.mapHeader || header.filter(h => h !== '__no')
    if (option.mapHeader) {
      header.filter(h => h !== '__no').forEach(h => {
        if (option.mapHeader.indexOf(h) === -1) rawHeader.push(h)
      })
    }
    if (!isPause)
      // const _header = header.map( (k, i) => i.toString() )
      onFinished({
        originalIndex: index,
        totalRawLines: no,
        rawHeader,
        fileName: file.name
      }, file)
  }

  const uploadChunk = async () => {
    const chunk = await getNextChunk()
    if (test) {
      const requestPromise = new Promise((resolve, reject) => {
        setTimeout(resolve, 100)
      }).then((response) => ({ promise: requestPromise, response }))
      requestPromise.no = processors.length
      // requestPromise.bytes = chunk.bytes
      processors.push(requestPromise)
    } else {
      const requestPromise: any = axios.request({
        url: `/etls/${index}/upload`,
        headers: {
          'Content-Type': "text/plain",
        },
        method: "POST",
        data: chunk
      }).then((response) => ({ promise: requestPromise, response }))
      requestPromise.no = processors.length
      // requestPromise.bytes = chunk.bytes
      processors.push(requestPromise)
    }
  }

  const getNextChunk = async () => {
    let plus = 0
    const _header = autoFixHeader(header.filter(key => key !== '__no')).map((k, i) => {
      if (option.mapHeader) {
        const index = option.mapHeader.indexOf(k)
        if (index === -1) return option.mapHeader.length + plus++
        return index
      } else return i
    })
    _header.unshift('__no')
    chunk.unshift(_header)
    const csvChunk = papa.unparse(chunk)
    // const bytes = csvChunk.length
    chunk = []
    if (!hasNextChunk) return csvChunk
    chunkPromise = new Promise((resolve, reject) => chunkPromiseResolve =
      resolve)
    uploader.resume()
    await chunkPromise
    return csvChunk
  }

  const deleteIndex = () => {
    if (!index) setTimeout(() => deleteIndex(), 3000)
    else afterClose(index)
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
    deleteIndex()
  }

  start()

  return { resume, pause, abort }
}
