const r = require('rethinkdb');
let conn;

const setup = () => {
  if (!conn)
    return r
      .connect({ host: 'localhost', port: 28015, db: 'newa' })
      .then(_conn => (conn = _conn));
  return Promise.resolve(conn);
};

module.exports.deploymentChanges = cb => {
  setup()
    .then(conn =>
      r
        .table('deployments')
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

// class R {
//   constructor() {}
// }
