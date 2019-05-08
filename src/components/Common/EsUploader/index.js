import axios from 'axios';
import papa from 'papaparse';

const chunkSize = 1 * 1024 * 1024

export default function EsUploader(file, option = {}) {
  let isPause = false
  let no = 0
  let loaded = 0
  let isStop = false
  let uploader = null
  let rawHeader = []
  // let cleanHeader = []
  const { onProgress, onError, onFinished } = option;

  const autoFixHeader = (rawHeader) => {
    const temp = {};
    return rawHeader.map((h, i) => {
      h = h.trim();
      if (/^$/.test(h)) {
        h = `Unnamed_${i}`;
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
    const { data } = await axios.get('/etls/createIndex');
    const { index: dataIndex } = data;
    let chunk = ''
    let header = ''
    papa.parse(file, {
      step: (result, parser) => {
        uploader = parser
        const _row = result.data[0]
        if (!header) {
          rawHeader = autoFixHeader(_row).map(v => encodeURIComponent(v))
          // cleanHeader = rawHeader
          return header = '__no,' + rawHeader.toString()
        }
        const row = _row.map(v => encodeURIComponent(v))
        if (row.toString() === '') return
        chunk += no + ',' + row.toString()
        loaded += row.length
        no++
        if (chunk.length < chunkSize) chunk += '\n'
        else {
          parser.pause()
          isPause = true

          axios.request({
            url: `/etls/${dataIndex}/upload`,
            headers: {
              'Content-Type': "text/plain",
            },
            method: "POST",
            data: header + '\n' + chunk,
          }).then(() => {
            onProgress(`${loaded}/${file.size}`, '')
            // setUploadStatus('uploaded: ' + no + ' lines')
            chunk = ''
            isPause = false
            if (!isStop) parser.resume()
          })
        }
      },
      complete: async () => {
        while (chunk[chunk.length - 1] === '\n') chunk = chunk.slice(0, -1)

        axios.request({
          url: `/etls/${dataIndex}/upload`,
          method: "POST",
          headers: {
            'Content-Type': "text/plain",
          },
          data: header + '\n' + chunk,
        }).then(async () => {
          chunk = ''
          const { data } = await axios.get(`/etls/${dataIndex}/header`)
          const header = data.split(',').map(v => decodeURIComponent(v)).filter(k => k !== '__no')
          onFinished({
            originalIndex: dataIndex,
            totalRawLines: no,
            cleanHeader: header,
            rawHeader: header,
            dataHeader: header,
          }, file)
        })
        // setUploadStatus('finished, total uploaded: ' + no + ' lines')

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
