const wss = require('../webSocket')
const { redis } = require('redis')
const axios = require('axios')
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
    const colMap = {}
    const colValueCounts = {}
    const rawDataView = {}
    const nullLineCounts = {}
    const mismatchLineCounts = {}
    const outlierLineCounts = {}
    const will_be_drop_500_lines = []
    Object.entries(data).forEach(([key, metric]) => {
      const stats = metric.originalStats
      colType[key] = metric.type
      colMap[key] = metric.originalCategoricalMap.reduce((prev, b, index) => {
        prev[b.key] = index
        return prev
      }, {})
      colValueCounts[key] = metric.originalCategoricalMap.reduce((prev, b) => {
        prev[b.key] = b.doc_count
        return prev
      }, {})
      rawDataView[key] = { ...stats, std: stats.std_deviation }
      const issue = stats.numerical || {}
      nullLineCounts[key] = issue.missingValue || 0
      mismatchLineCounts[key] = issue.mismatch || 0
      outlierLineCounts[key] = issue.outlierCount || 0
    })
    const result = {
      colType,
      colMap,
      colValueCounts,
      rawDataView,
      nullFillMethod: {},
      nullIndex: {},
      mismatchFillMethod: {},
      mismatchIndex: {},
      outlierFillMethod: {},
      outlierIndex: {},
      totalFixedLines: 0,
      nullLineCounts,
      mismatchLineCounts,
      outlierLineCounts,
      will_be_drop_500_lines,
      stats: data,
      originalIndex: index,
      nullLineCountsOrigin: nullLineCounts,
      mismatchLineCountsOrigin: mismatchLineCounts,
      outlierLineCountsOrigin: outlierLineCounts,

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

  if (project.problemType && project.problemType !== 'Clustering' && project.problemType !== 'Outlier') {
    stats[project.target].isTarget = true
    let deletedValues = []
    if (project.targetArray && project.targetArray.length > 1) {
      deletedValues = Object.keys(project.colValueCounts[project.target]).filter(k => !project.targetArray.includes(k))
    } else {
      deletedValues = Object.entries(project.colValueCounts[project.target]).sort((a, b) => b[1] - a[1]).slice(2).map(([k]) => k)
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
      console.log('interval', data.task);
      if (data.task) {
        const status = data.task.status
        const progress = 95 * (status.created + status.deleted) / status.total || 0
        process({ progress, status: 1 })
      }
      else {
        clearInterval(interval)
        process({ progress: 95, status: 1 })
        const { data: { totalFixedCount, deletedCount } } = await axios.post(`${esServicePath}/etls/${project.originalIndex}/fixedLines`, stats)
        createOrUpdate(projectId, userId, { etlIndex, opaqueId, totalFixedLines: totalFixedCount, deletedCount })
        resolve({
          status: 200,
          message: 'ok',
          etlIndex
        })
      }
    }, 1000)
  })
});
