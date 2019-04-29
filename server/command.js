const { redis, pubsub } = require("redis");
const moment = require("moment");
const aa = require("./apis/propellerBff/api");
const config = require("../config");
const FINISH = 1;
const SEND = 2;

const DEBUG = process.env.DEPLOY_DEBUG;

console.log(aa);

const command = (command, callback) => {
  const returnPromise = new Promise((resolve, reject) => {
    const requestId = command.requestId;
    if (!requestId) return reject(new Error("no request id"));
    pubsub.lpush(config.requestQueue, JSON.stringify(command)).then(length => {
      if (DEBUG)
        console.log(
          `[command@${moment().format(
            "YYYY-MM-DD HH-mm-ss"
          )}]request(${length}):`,
          command
        );
    });
    if (!callback) return pubsub.once(requestId, resolve);
    const _callback = async result => {
      const returnValue = await callback(result);
      if (returnValue) {
        pubsub.removeListener(requestId, _callback);
        return resolve(returnValue);
      }
      // if (returnValue.progressStatus === SEND) return returnPromise.progress(returnValue)
    };
    pubsub.on(requestId, _callback);
  });
  return returnPromise;
};

const watchQueue = async () => {
  let result = null;
  while (1) {
    result = await pubsub.rpop(config.resultQueue);
    if (result === null) return;
    result = JSON.parse(result);
    if (DEBUG)
      console.log(
        `[command@${moment().format("YYYY-MM-DD HH-mm-ss")}]result:`,
        result
      );
    const requestId = result.requestId;
    pubsub.emit(requestId, result);
  }
};

const clearListener = requestId => {
  pubsub.removeAllListeners(requestId);
};

setInterval(watchQueue, 500);

command.FINISH = FINISH;
command.SEND = SEND;
command.clearListener = clearListener;

module.exports = command;
