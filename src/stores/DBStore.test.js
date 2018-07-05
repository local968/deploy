import db from './DBStore';

Object.keys(db).map(async key => {
  const unwatch = db[key].watch(console.log);
  const result = await db[key].insert([3, 2, 3, 4, 5]);
  db[key].select('primary', result[0]).then(console.log);
  db[key]
    .update('primary', result[0], [['=', 2, 3], ['+', 3, 1], ['-', 4, 1]])
    .then(console.log);
  db[key]
    .upsert([1, 2, 3, 4, 5], [['=', 2, 3], ['+', 3, 1], ['-', 4, 1]])
    .then(console.log);
  db[key].replace([result[0], 5, 4, 3, 2]).then(console.log);
  db[key].delete(result[0]).then(console.log);
  unwatch();
});
