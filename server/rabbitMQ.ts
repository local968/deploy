import _ from 'lodash';
import amqp from 'amqplib';
import { pubsub } from './redis';
import config from '../config';

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
  QUEUE_RESULT,
} = config.mq;

export default class RabbitMQ {
  amqplib;
  connect = () => {
    amqp
      .connect({
        protocol: AMQPLIB_PROTOCOL,
        hostname: AMQPLIB_HOSTNAME,
        port: _.toInteger(AMQPLIB_PORT),
        username: AMQPLIB_USERNAME,
        password: AMQPLIB_PASSWORD,
        locale: AMQPLIB_LOCALE,
        frameMax: _.toNumber(AMQPLIB_FRAMEMAX),
        heartbeat: _.toNumber(AMQPLIB_HEARTBEAT),
        vhost: AMQPLIB_VHOST,
      })
      .then(conn => {
        this.amqplib = conn;
        console.error('************** mq 连接成功');
        conn.on('close', () => {
          this.amqplib = undefined;
          console.error('************** mq 连接失败，开始重连');
          this.connect();
        });
        conn.on('error', (err) => {
          this.amqplib = undefined;
          console.error(err, '************** mq 连接错误，开始重连');
          this.connect();
        })
      })
      .catch(() => {
        this.amqplib = undefined;
        setTimeout(() => {
          this.connect();
        }, 2000);
      });
  };
  getAmqplib = async () => {
    if (this.amqplib) {
      return this.amqplib;
    } else {
      this.connect();
      return new Promise((resolve, reject) => {
        const timmer = setInterval(() => {
          if (this.amqplib) {
            resolve(this.amqplib);
            clearInterval(timmer);
          }
        }, 500);
      });
    }
  };
  publisher = async task => {
    const queueName = _.includes(task.command, `${config.requestQueue}.`)
      ? task.command
      : `${config.requestQueue}.${task.command}`;
    // console.log(queueName);
    const mq = await this.getAmqplib();
    const ch = await mq.createChannel();
    // 创建队列
    await ch.assertQueue(queueName);

    !_.isEmpty(task) &&
      (await ch.sendToQueue(queueName, Buffer.from(JSON.stringify(task))));

    await ch.close();
  };
  consumer = async () => {
    const mq = await this.getAmqplib();
    const ch = await mq.createChannel();

    const res = await ch.assertExchange('result', 'direct', { durable: true });
    // console.log('res:', res);

    const queue_lists = QUEUE_RESULT && QUEUE_RESULT.split(';');

    // console.log('监听队列列表：', queue_lists);

    _.forEach(queue_lists, queue => {
      this.consume(ch, queue, msg => {
        if (msg) {
          pubsub.lpush(config.resultQueue, msg);
        }
      }).catch(console.error);
    });
  };
  consume = async (ch, queue, callBack) => {
    const q = await ch.assertQueue(queue, { exclusive: false });

    await new Promise(resolve =>
      ch.consume(
        q.queue,
        msg => {
          resolve(msg);

          const content = msg && msg.content.toString();
          // console.log('收到消息: ', `queue: ${queue}`, content);
          ch.ack(msg);

          if (content && callBack) {
            callBack(content);
          }
        },
        { noAck: false },
      ),
    ).catch(err => {
      throw err;
    });
  };

  constructor() {
    this.consumer();
  }
}
