import db from './DBStore';

Object.keys(db).map(async key => {
  const unwatch = db[key].watch(console.log);
  const result = await db[key].insert([1, 2, 3, 4, 5]);
  db[key].get('id', result.id).then(console.log);
  db[key]
    .update('id', result.id, [['=', 2, 3], ['+', 3, 1], ['-', 4, 1]])
    .then(console.log);
  db[key]
    .upsert([1, 2, 3, 4, 5], [['=', 2, 3], ['+', 3, 1], ['-', 4, 1]])
    .then(console.log);
  db[key].replace([result.id, 5, 4, 3, 2]).then(console.log);
  db[key].delete(result.id).then(console.log);
  unwatch();
});
