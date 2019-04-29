const { redis, pubsub } = require("redis");
const moment = require("moment");
const amqp = require("amqplib");
const _ = require("lodash");
const RabbitMQ = require('./rabbitMQ');
const config = require("../config");
const FINISH = 1;
const SEND = 2;

const DEBUG = process.env.DEPLOY_DEBUG;
const rabbitMQ = new RabbitMQ();

const command = async (command, callback) => {
  const returnPromise = new Promise((resolve, reject) => {
    const requestId = command.requestId;
    if (!requestId) return reject(new Error("no request id"));
    rabbitMQ
      .publisher(command)
      .then(length => {
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

async function initServer(conn) {
  console.log("dddddaasasasa");
  const ch = await conn.createChannel();

  // pub
  await ch.assertExchange(subEx, "topic", { durable: true });
  await ch.assertExchange(fakerEx, "fanout", { durable: true });
  // await ch.deleteQueue(fakerQueue)
  await ch.assertQueue(fakerQueue);
  await ch.bindQueue(fakerQueue, fakerEx, fakerQueue + fakerRouting);
  console.log("dfgffg");

  ch.on("close", () => {
    console.log("server close");
  });

  ch.on("error", err => {
    console.log(err, "server error");
  });

  ch.consume(
    fakerQueue,
    msg => {
      if (!msg) return;
      console.log("server consume");
      const {
        content,
        properties: { correlationId }
      } = msg;
      const fakerCallback = msg => {
        console.log("faker publish");
        ch.publish(
          subEx,
          "test" + subRouting,
          Buffer.from(JSON.stringify(msg)),
          { correlationId }
        );
      };
      let data = content.toString();
      try {
        data = JSON.parse(data);
      } catch (e) {}
      console.log(data, fakerCallback, "send to command!!!!");
      command(data, fakerCallback);
      // ch.ack(msg)
    },
    { noAck: true }
  );
  const send = correlationId => {
    ch.publish(subEx, "test" + subRouting, "", {
      correlationId,
      header: { r2Delete: true }
    });
  };
  const close = () => {
    ch.ackAll();
    ch.close();
  };
  return {
    send,
    close
  };
}
