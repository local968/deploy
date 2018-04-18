const r = require('rethinkdb');

const SCHEDULE_TABLE = 'schedules';
const DEPLOYMENT_TABLE = 'deployments';
const APPROACH_TABLE = 'approaches';
const MODEL_TABLE = 'models';
const DB = 'newa';

let conn;

const catchError = console.error;

const errHandler = (resolve, reject) => (err, result) =>
  err ? reject(err) : resolve(result);

const setup = () => {
  if (!conn) {
    return r
      .connect({ host: 'localhost', port: 28015, db: 'newa' })
      .then(_conn => (conn = _conn))
      .then(checkTable);
  }

  return Promise.resolve(conn);
};

const checkTable = conn => {
  r
    .db(DB)
    .tableList()
    .run(conn, (err, list) => {
      if (list.indexOf(SCHEDULE_TABLE) === -1)
        createTable(conn, SCHEDULE_TABLE)
          .then(createIndex(conn, SCHEDULE_TABLE, 'createdDate'))
          .then(createIndex(conn, SCHEDULE_TABLE, 'estimatedTime'));
      if (list.indexOf(DEPLOYMENT_TABLE) === -1)
        createTable(conn, DEPLOYMENT_TABLE).then(
          createIndex(conn, DEPLOYMENT_TABLE, 'createdDate')
        );
    });
  return conn;
};

const createTable = (conn, name) => r.tableCreate(name).run(conn);

const createIndex = (conn, tableName, indexName) => () =>
  r
    .table(tableName)
    .indexCreate(indexName)
    .run(conn);

module.exports.deploymentChanges = cb =>
  setup()
    .then(conn =>
      r
        .table(DEPLOYMENT_TABLE)
        .changes()
        .run(conn)
    )
    .then(cursor => {
      cursor.each((err, data) => {
        if (err) throw err;
        if (cb && typeof cb === 'function') cb(data);
      });
    })
    .catch(catchError);

module.exports.getDeployment = id =>
  setup()
    .then(conn =>
      r
        .table(DEPLOYMENT_TABLE)
        .get(id)
        .run(conn)
    )
    .catch(catchError);

module.exports.getModel = id =>
  setup()
    .then(conn =>
      r
        .table(MODEL_TABLE)
        .get(id)
        .run(conn)
    )
    .catch(catchError);

module.exports.getApproach = projectId =>
  setup()
    .then(
      conn =>
        new Promise((resolve, reject) =>
          r
            .table(APPROACH_TABLE)
            .filter({ projectId })
            .run(conn, (err, cursor) => {
              if (err) return reject(err);
              cursor.toArray(errHandler(resolve, reject));
            })
        )
    )
    .catch(catchError);

module.exports.scheduleFilter = filter =>
  setup()
    .then(
      conn =>
        new Promise((resolve, reject) =>
          r
            .table(SCHEDULE_TABLE)
            .filter(filter)
            .run(conn, (err, cursor) => {
              if (err) return reject(err);
              cursor.toArray(errHandler(resolve, reject));
            })
        )
    )
    .catch(catchError);

module.exports.scheduleDelete = filter =>
  setup()
    .then(conn =>
      r
        .table(SCHEDULE_TABLE)
        .filter(filter)
        .delete()
        .run(conn)
    )
    .catch(catchError);

module.exports.scheduleUpsert = schedule =>
  setup()
    .then(
      conn =>
        schedule.id
          ? r
              .table(SCHEDULE_TABLE)
              .get(schedule.id)
              .update(schedule)
              .run(conn)
          : r
              .table(SCHEDULE_TABLE)
              .insert(schedule)
              .run(conn)
    )
    .catch(catchError);

module.exports.lastWaitingSchedule = (deploymentId, type) =>
  new Promise((resolve, reject) => {
    setup().then(conn =>
      r
        .db('newa')
        .table(SCHEDULE_TABLE)
        .orderBy({ index: r.desc('estimatedTime') })
        .filter({ type, deploymentId, status: 'waiting' })
        .limit(1)
        .run(conn, (err, cursor) => {
          if (err) return reject(err);
          cursor.toArray(errHandler(resolve, reject));
        })
    );
  }).catch(catchError);

module.exports.lastHandledSchedule = (deploymentId, type) =>
  new Promise((resolve, reject) => {
    setup().then(conn =>
      r
        .db('newa')
        .table(SCHEDULE_TABLE)
        .orderBy({ index: r.desc('estimatedTime') })
        .filter({ type, deploymentId })
        .filter(r.row('status').ne('waiting'))
        .limit(1)
        .run(conn, (err, cursor) => {
          if (err) return reject(err);
          cursor.toArray(errHandler(resolve, reject));
        })
    );
  }).catch(catchError);

module.exports.getTimeUpSchedules = now =>
  new Promise((resolve, reject) => {
    setup()
      .then(conn =>
        r
          .db('newa')
          .table(SCHEDULE_TABLE)
          .filter({ status: 'waiting' })
          .filter(r.row('estimatedTime').le(now))
          .run(conn, (err, cursor) => {
            if (err) return reject(err);
            cursor.toArray(errHandler(resolve, reject));
          })
      )
      .catch(catchError);
  }).catch(catchError);

module.exports.getScheduleCount = (deploymentId, type) =>
  setup().then(conn =>
    r
      .db('newa')
      .table(SCHEDULE_TABLE)
      .filter({ type, deploymentId })
      .filter(r.row('status').ne('waiting'))
      .count()
      .run(conn)
  );

module.exports.getProgressingScheduleCount = () =>
  setup().then(conn =>
    r
      .db('newa')
      .table(SCHEDULE_TABLE)
      .filter(r.row('status').ne('progressing'))
      .count()
      .run(conn)
  );

module.exports.getQueueSchedules = limit =>
  new Promise((resolve, reject) => {
    setup()
      .then(conn =>
        r
          .db('newa')
          .table(SCHEDULE_TABLE)
          .filter({ status: 'queue' })
          .orderBy(r.asc('updatedDate'))
          .limit(limit)
          .run(conn, (err, cursor) => {
            if (err) return reject(err);
            cursor.toArray(errHandler(resolve, reject));
          })
      )
      .catch(catchError);
  }).catch(catchError);
