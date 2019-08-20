import { Router } from 'express'
import config from '../../config'
import { redis } from '../redis'

const router = Router()

function queryModelList(id: any, process: any) {
  const key = `project:${id}:models`;
  return redis.smembers(key).then(ids => {
    let promise: Promise<void> = Promise.resolve();
    ids.forEach(modelId => {
      const curPromise: Promise<void> = new Promise(async (resolve) => {
        try {
          const result = await redis.hgetall(`project:${id}:model:${modelId}`);
          const model = Object.entries(result).reduce((prev: {}, [key, value]: [string, string]) => {
            prev[key] = JSON.parse(value);
            return prev;
          }, {});
          process({
            status: 200,
            message: 'ok',
            model,
          });
        }
        catch (e) {
          process({
            status: 417,
            message: `init model ${modelId} failed`
          });
        }
        resolve();
      });
      promise = promise.then(() => curPromise);
    });
    return promise.then(() => ({
      status: 200,
      message: 'ok'
    }));
  });
}

router.get('/', (req, res) => {
  const { id, sign } = req.query

  if (sign !== config.EXPORT_SECRET) return res.status(400).json({
    status: 400,
    message: 'auth error'
  })

  return redis.hgetall('project:' + id).then(p => {
    const project = {
      colType: JSON.parse(p.colType || '""'),
      colMap: JSON.parse(p.colMap || '""'),
      rawDataView: JSON.parse(p.rawDataView || '""'),
      nullFillMethod: JSON.parse(p.nullFillMethod || '""'),
      mismatchFillMethod: JSON.parse(p.mismatchFillMethod || '""'),
      outlierFillMethod: JSON.parse(p.outlierFillMethod || '""'),
      featureLabel: JSON.parse(p.dataHeader || '""'),
      targetLabel: [JSON.parse(p.target || '""')],
      problemType: JSON.parse(p.problemType || '""'),
      mapHeader: JSON.parse(p.mapHeader || '""'),
      cutoff: {}
    }
    let promise = Promise.resolve()
    if (project.problemType === 'Classification') promise = queryModelList(id, result => {
      const { status, model } = result
      if (status !== 200) return
      const { chartData, fitIndex, id } = model
      const { roc: { Threshold } } = chartData
      project.cutoff[id] = Threshold[fitIndex]
    });

    return promise.then(() => {
      return res.json({
        status: 100,
        message: 'ok',
        data: project
      })
    })
  })
})

export default router