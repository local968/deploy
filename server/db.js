const r = require('rethinkdb');

const SCHEDULE_TABLE = 'schedules';
const DEPLOYMENT_TABLE = 'deployments';
const DB = 'newa';

let conn;

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
        createTable(conn, SCHEDULE_TABLE);
      if (list.indexOf(DEPLOYMENT_TABLE) === -1)
        createTable(conn, DEPLOYMENT_TABLE);
    });
  return conn;
};

const createTable = (conn, name) => {
  r.tableCreate(name).run(conn, (err, result) => {
    if (err) return console.err(`${name} table create failed!`, err);
    if (result.tables_created === 1)
      return console.log(`${name} table created!`);
    console.log(result);
  });
};

module.exports.deploymentChanges = cb => {
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
    });
};

module.exports.scheduleFilter = filter =>
  setup().then(
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
  );

module.exports.scheduleDelete = filter =>
  setup().then(conn =>
    r
      .table(SCHEDULE_TABLE)
      .filter(filter)
      .delete()
      .run(conn)
  );

module.exports.scheduleUpsert = schedule =>
  setup().then(
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
  );
