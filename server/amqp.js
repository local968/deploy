const amqp = require("amqplib");
const uuid = require("uuid");
const command = require("./command");
const config = require("config");

const pubEx = config.PUBEX || "r2ai_req";
const pubRouting = config.PUBROUTE || ".r2.request";

const subEx = config.SUBEX || "r2ai_res";
const subRouting = config.SUBROUTE || ".r2.result";
const subQueue = config.SUBQUEUE || "r2ai_sub";

const fakerQueue = "r2ai_faker";
const fakerRouting = ".faker";
const fakerEx = "r2ai_faker";

const FINISH = 1;
const SEND = 2;

// const propellerApi = new PropellerApi({
//   basePath: config.services.PROPELLER_BFF
// });

const {
  AMQPLIB_PROTOCOL,
  AMQPLIB_PORT,
  AMQPLIB_HOSTNAME,
  AMQPLIB_USERNAME,
  AMQPLIB_PASSWORD,
  AMQPLIB_LOCALE,
  AMQPLIB_FRAMEMAX,
  AMQPLIB_HEARTBEAT,
  AMQPLIB_VHOST
} = config.mq;

let conn;
let server;
let client;

const mq = async (data, callback, faker = false) => {
  try {
    if (!conn) {
      console.log({
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

      try {
        conn = await amqp.connect({
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
        console.log(conn);
      } catch (e) {
        console.error(e);
      }
    }
    if (!server) {
      try {
        server = faker
          ? await initServer(conn)
          : {
              close: () => {}
            };
      } catch (e) {
        console.error(e);
      }
    }

    if (!client) {
      try {
        console.log("init client");
        client = await initClient(conn, faker);
      } catch (e) {
        console.error(e);
      }
    }

    return client.send(data, callback).then(result => {
      console.log(result, "result");
      return result;
    });
  } catch (e) {
    console.log({ ...e });
    const error = {
      status: -99,
      message: e.message
    };
    return callback ? callback(error) : error;
  }
};

async function initClient(conn, faker) {
  console.log(conn);
  const ch = await conn.createChannel();

  // sub
  await ch.assertExchange(subEx, "topic", { durable: true });
  // await ch.deleteQueue(subQueue)
  await ch.assertQueue(subQueue);
  await ch.bindQueue(subQueue, subEx, "*" + subRouting);

  //pub
  const ex = faker ? fakerEx : pubEx;
  const routing = faker ? fakerRouting : pubRouting;
  await ch.assertExchange(ex, "fanout", { durable: true });

  ch.on("close", () => {
    console.log("client close");
  });

  ch.on("error", err => {
    console.log(err, "client error");
  });

  const send = (msg, callback) => {
    const corr = msg.requestId;
    return new Promise(resolve => {
      ch.publish(ex, "*" + routing, Buffer.from(JSON.stringify(msg)), {
        correlationId: corr
      });
    });
  };

  const done = data => {
    command.clearListener(corr);
    resolve(data);
  };

  ch.consume(
    subQueue,
    async msg => {
      if (!msg) return;
      console.log("client consume");
      const {
        content,
        properties: { correlationId },
        header = {}
      } = msg;
      if (correlationId === corr) {
        if (header.r2Delete) {
          return close();
        }
        let data = content.toString();
        try {
          data = JSON.parse(data);
        } catch (e) {}
        if (!callback) return done(data);
        const result = await callback(data);
        if (result) return done(result);
      }
    },
    { noAck: true }
  );

  const close = () => {
    ch.ackAll();
    ch.close();
  };
  return {
    send,
    close
  };
}

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

async function clearListener(requestId) {
  try {
    const conn = await amqp.connect("amqp://localhost");
    const server = await initServer(conn);
    server.send(requestId);
    command.clearListener(requestId);
  } catch (e) {
    return;
  }
}

mq.FINISH = FINISH;
mq.SEND = SEND;
mq.clearListener = clearListener;

module.exports = mq;

// try {
//   amqp.connect('amqp://localhost').then(conn => {

//     // for (let i = 0; i < 5000; i++) {
//     // const queue = uuid.v4()

//     // conn.createChannel().then(ch => {
//     //   ch.assertQueue(rpc, { exclusive: true })
//     //   // ch.assertExchange(ex)
//     //   // ch.bindQueue(queue, ex, pattern)
//     //   // ch.bindQueue(queue, ex, '')
//     //   ch.consume(rpc, msg => {
//     //     const n = parseInt(msg.content.toString());
//     //     console.log(console.log('consume [.] get %s', n))
//     //     setTimeout(() => {
//     //       const r = Math.pow(n, 2)
//     //       console.log('consume [.] send %s', r)
//     //       ch.sendToQueue(msg.properties.replyTo,
//     //         new Buffer(r.toString()),
//     //         { correlationId: msg.properties.correlationId });
//     //       ch.ack(msg);
//     //     }, 20000)
//     //   })
//     // })

//     // conn.createChannel().then(ch => {
//     //   const corr = uuid.v4()
//     //   ch.assertQueue(queue, { exclusive: true })
//     //   ch.assertQueue(rpc, { exclusive: true })
//     //   ch.consume(queue, (msg) => {
//     //     if (msg.properties.correlationId == corr) {
//     //       console.log('publish [.] send %s', msg.content.toString());
//     //     }
//     //   }, { noAck: true });
//     //   console.log('publish [.] send %s', i);
//     //   ch.sendToQueue(rpc,
//     //     new Buffer(i.toString()),
//     //     { correlationId: corr, replyTo: queue });
//     //   // ch.assertExchange(ex)
//     //   // ch.bindQueue(queue, ex, pattern)
//     //   // setInterval(() => {
//     //   // ch.publish(ex, pattern, Buffer.from('hello'));
//     //   // console.log("pub")
//     //   // }, 1000)
//     // })
//     // }

//   }, err => {
//     console.log(err, 'error')
//   })
// } catch (e) {
//   console.log(e, "mmm")
// }
