
key = 'test';
const unwatch = db[key].watch(console.log);
const result = await db[key].insert({ id: 9, test: 2 });
const id = result.result.id;
db[key].select('primary', id).then(console.log);
db[key].select('test', 7).then(console.log);
db[key].replace({ id, test: 7 }).then(console.log);
// db[key].delete('primary', id).then(console.log);
unwatch();
