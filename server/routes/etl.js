const command = require('../command')
const wss = require('../webSocket')
const { redis } = require('redis')
const axios = require('axios')
const fs = require('fs')
const config = require('config')

const { createOrUpdate } = require('./project')

const esServicePath = config.services.ETL_SERVICE; //'http://localhost:8000'

wss.register("originalStats", async (message, socket, progress) => {
  const { userId } = socket.session
  const { index, projectId } = message
  try {
    const { data } = await axios.get(`${esServicePath}/etls/${index}/stats`)
    // fs.writeFile('response.json', JSON.stringify(data), { flag: 'a' }, () => { })
    const colType = {}
    const fields = []
    const colMap = {}
    const colValueCounts = {}
    const rawDataView = {}
    const outlierRange = {}
    const nullLineCounts = {}
    const mismatchLineCounts = {}
    const outlierLineCounts = {}
    const will_be_drop_500_lines = []
    Object.entries(data).forEach(([key, metric]) => {
      const stats = metric.originalStats
      colType[key] = metric.type
      fields.push(key)
      colMap[key] = Object.entries(metric.originalCategoricalMap).reduce((prev, [key, b], index) => {
        prev[b.key] = index
        return prev
      }, {})
      colValueCounts[key] = Object.entries(metric.originalCategoricalMap).reduce((prev, [key, b]) => {
        prev[b.key] = b.doc_count
        return prev
      }, {})
      rawDataView[key] = { ...stats, std: stats.std_deviation }
      outlierRange[key] = [stats.high, stats.low]
      nullLineCounts[key] = stats.numerical.missingValue
      mismatchLineCounts[key] = stats.numerical.missingValue
      outlierLineCounts[key] = stats.numerical.missingValue
    })
    const result = {
      colType,
      fields,
      colMap,
      colValueCounts,
      rawDataView,
      rawHeader: fields,
      dataHeader: fields,
      nullFillMethod: {},
      nullIndex: {},
      mismatchFillMethod: {},
      mismatchIndex: {},
      outlierFillMethod: {},
      outlierIndex: {},
      outlierRange: {},
      name: 'etl',
      totalRawLines: 119999,
      uniqueValues: {},
      numberBins: {},
      warnings: [],
      totalFixedLines: 0,
      nullLineCounts: {},
      mismatchLineCounts: {},
      outlierLineCounts: {},
      will_be_drop_500_lines,
      stats: data,
      originalIndex: index,

      mainStep: 2,
      curStep: 2,
      lastSubStep: 2,
      subStepActive: 2,
      etling: false,
      etlProgress: 0
    }
    await createOrUpdate(projectId, userId, result)
    return { status: 200, message: 'ok', result }
  } catch (e) {
    console.log({ ...e })
    let error = e
    if (e.response && e.response.data) error = e.response.data
    return { status: 500, message: 'get index stats failed', error }
  }
})

wss.register('newEtl', async (message, socket, process) => {
  const { userId } = socket.session
  const { projectId } = message
  const result = await redis.hgetall(`project:${projectId}`)
  for (let key in result) {
    try {
      result[key] = JSON.parse(result[key])
    } catch (e) { }
  }
  if (result.userId !== userId) return { status: 420, message: 'error' }
  const project = result
  const stats = project.stats
  stats[project.target].isTarget = true

  let deletedValues = []
  if (project.targetArray && project.targetArray.length > 1) {
    deletedValues = Object.keys(project.colValueCounts[project.target]).filter(k => !project.targetArray.includes(k))
  } else {
    deletedValues = Object.entries(project.colValueCounts[project.target]).sort((a, b) => b[1] - a[1]).map(([k]) => k)
  }

  stats[project.target].mapFillMethod = {
    ...Object.entries(project.renameVariable).reduce((prev, [key, value]) => {
      prev[key] = {
        type: 'replace',
        value
      }
      return prev
    }, {}),
    ...deletedValues.reduce((prev, key) => {
      prev[key] = {
        type: 'delete'
      }
      return prev
    }, {})
  }

  for (let key in stats) {
    const mismatch = project.mismatchFillMethod[key]
    if (mismatch === 'delete') stats[key].mismatchFillMethod = { type: 'delete' }
    if (mismatch && mismatch !== 'ignore') stats[key].mismatchFillMethod = { type: 'replace', value: mismatch }

    const missingValue = project.nullFillMethod[key]
    if (missingValue === 'delete') stats[key].missingValueFillMethod = { type: 'delete' }
    if (missingValue && missingValue !== 'ignore') stats[key].missingValueFillMethod = { type: 'replace', value: missingValue }

    const outlier = project.outlierFillMethod[key]
    if (outlier === 'delete') stats[key].outlierFillMethod = { type: 'delete' }
    if (outlier && outlier !== 'ignore') stats[key].outlierFillMethod = { type: 'replace', value: outlier }
  }
  const response = await axios.post(`${esServicePath}/etls/${project.originalIndex}/etl`, stats)
  const { etlIndex, opaqueId } = response.data
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const { data } = await axios.get(`${esServicePath}/etls/getTaskByOpaqueId/${opaqueId}`)
      if (data.task) {
        if (data.task.status) {
          const status = data.task.status
          const progress = 95 * (status.created + status.deleted) / status.total || 0
          process({ progress, status: 1 })
        }
      } else {
        clearInterval(interval)
        process({ progress: 95, status: 1 })
        const { data: { totalFixedCount, deletedCount } } = await axios.post(`${esServicePath}/etls/${project.originalIndex}/fixedLines`, stats)
        createOrUpdate(projectId, userId, { etlIndex, opaqueId, totalFixedLines: totalFixedCount, deletedCount, etlProgress: 0 })
        resolve({
          status: 200,
          message: 'ok',
          etlIndex
        })
      }
    }, 1000)
  })
});
