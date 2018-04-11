import db from './db.js';

const _cache = {};

class ApproachStore {
  getApproach = projectId =>
    _cache[projectId]
      ? Promise.resolve(_cache[projectId])
      : new Promise((resolve, reject) => {
          projectId = parseInt(projectId, 10);
          db('approaches')
            .find({ projectId })
            .fetch()
            .subscribe(approach => {
              _cache[projectId] = approach;
              resolve(approach);
            }, reject);
        });
}

export default new ApproachStore();
