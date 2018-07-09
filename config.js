let localConfig = {};
try{
  localConfig = require("./local_config.js")
}catch(e){
  
}
 
module.exports = Object.assign({
  db: {
    name: 'newa',
    host: '127.0.0.1',
    port: 28015
  },
  token_secret: 'NewATechDeMO',
  port: 3000,
  queuePeriod: 60,
  schedulePeriod: 60,
  maxConcurrencySchedule: 2,
  projPath: "/home/dcc"
}, localConfig)
