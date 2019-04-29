

export default function EsUploader(file, option = {}) {
  let isPause = false
  let no = 0
  let loaded = 0
  let isStop = false
  let uploader = null
  let rawHeader = []
  let cleanHeader = []
  const { onProgress, onError, onComplete } = option;

  const autoFixHeader = (rawHeader) => {
    const temp = {};
    return rawHeader.map((h, i) => {
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
  }

  const upload = async () => {
    const dataIndex = await actions.createIndex({})
    let chunk = ''
    let header = ''
    papa.parse(file, {
      step: (result, parser) => {
        uploader = parser
        const row = result.data[0]
        if (!header) {
          rawHeader = row
          cleanHeader = autoFixHeader(row)
          return header = '__no,' + cleanHeader.toString()
        }
        if (row.toString() === '') return
        chunk += no + ',' + row.toString()
        loaded += row.length
        no++
        if (chunk.length < chunkSize) chunk += '\n'
        else {
          parser.pause()
          isPause = true
          await actions.upload({
            index: dataIndex, requestBody: header + '\n' + chunk, option: {
              headers: { 'content-type': 'text/csv', 'filename': file.name }
            }
          })
          onProgress({
            loaded: loaded,
            size: file.size
          })
          // setUploadStatus('uploaded: ' + no + ' lines')
          chunk = ''
          isPause = false
          if (!isStop) parser.resume()
        }
      },
      complete: () => {
        while (chunk[chunk.length - 1] === '\n') chunk = chunk.slice(0, -1)
        await actions.upload({
          index: dataIndex, requestBody: header + '\n' + chunk, option: {
            headers: { 'content-type': 'text/csv', 'filename': file.name }
          }
        })
        // setUploadStatus('finished, total uploaded: ' + no + ' lines')
        chunk = ''
        onComplete({
          fileId: dataIndex,
          totalRawLines: no,
          cleanHeader,
          rawHeader,
          dataHeader: cleanHeader
        })
        // setTotalLines(no)
        // resolve()
      }
    })
  }

  const resume = () => {
    if (!isStop) return
    isStop = false
    uploader && uploader.resume()
  }

  const pause = () => {
    if (isStop) return
    isStop = true
    uploader && uploader.pause()
  }

  const abort = () => {
    uploader && uploader.abort()
    uploader = null
    rawHeader = []
    no = 0
    loaded = 0
    isPause = false
    isStop = false
  }

  try {
    upload()
  } catch (e) {
    onError(e)
  }

  return {
    resume,
    pause,
    abort
  }
}