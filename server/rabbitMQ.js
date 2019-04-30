const _ = require("lodash");
const amqp = require("amqplib");
const { pubsub } = require("redis");

const config = require("config");

const {
  AMQPLIB_PROTOCOL,
  AMQPLIB_PORT,
  AMQPLIB_HOSTNAME,
  AMQPLIB_USERNAME,
  AMQPLIB_PASSWORD,
  AMQPLIB_LOCALE,
  AMQPLIB_FRAMEMAX,
  AMQPLIB_HEARTBEAT,
  AMQPLIB_VHOST,
  QUEUE_RESULT
} = config.mq;

module.exports = function RabbitMQ(){
  this.getAmqplib = async () => {
    if (this.amqplib) {
      return this.amqplib;
    } else {
      try {
        this.amqplib = await amqp.connect({
          protocol: AMQPLIB_PROTOCOL,
          hostname: AMQPLIB_HOSTNAME,
          port: AMQPLIB_PORT,
          username: AMQPLIB_USERNAME,
          password: AMQPLIB_PASSWORD,
          locale: AMQPLIB_LOCALE,
          frameMax: AMQPLIB_FRAMEMAX,
          heartbeat: AMQPLIB_HEARTBEAT,
          vhost: AMQPLIB_VHOST
        });
      } catch (e) {
        console.error(e);
      }
      return this.amqplib;
    }
  };

  this.publisher = async (task) => {
    const queueName = _.includes(task.command, `${config.requestQueue}.`)
      ? task.command
      : `${config.requestQueue}.${task.command}`;

    const mq = await this.getAmqplib();
    const ch = await mq.createChannel();
    // 创建队列
    await ch.assertQueue(queueName);

    !_.isEmpty(task) &&
    (await ch.sendToQueue(queueName, Buffer.from(JSON.stringify(task))));

    await ch.close();
  }

  // Consumer
  this.consumer = async ()=> {
    const mq = await this.getAmqplib();
    const ch = await mq.createChannel();

    const res = await ch.assertExchange("result", "direct", { durable: true });
    console.log("res:", res);

    const queue_lists = QUEUE_RESULT && QUEUE_RESULT.split(";");

    console.log("监听队列列表：", queue_lists);

    _.forEach(queue_lists, queue => {
      this.consume(ch, queue, msg => {
        if (msg) {
          pubsub.lpush(config.resultQueue, msg);
        }
      }).catch(console.error);
    });
  }

  // consume
  this.consume = async(ch, queue, callBack)=> {
    const q = await ch.assertQueue(queue, { exclusive: false });

    await new Promise(resolve =>
      ch.consume(
        q.queue,
        msg => {
          resolve(msg);

          const content = msg && msg.content.toString();
          console.log("收到消息: ", `queue: ${queue}`, content);
          ch.ack(msg);

          if (content && callBack) {
            callBack(content);
          }
        },
        { noAck: false }
      )
    ).catch(err => {
      throw err;
    });
  }

  this.consumer();

}

// module.exports = class RabbitMQ {
//   // Publisher
//
//   constructor() {
//
//
//
//   }
//
//   amqplib
//
// }
