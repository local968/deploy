const amqp = require('amqplib')
const uuid = require('uuid')
const command = require('./command')

const pubEx = 'r2_req'
const subEx = 'r2_res'
const pubRouting = '.request'
const subRouting = '.result'
const subQueue = 'r2_sub'

const fakerQueue = 'r2_faker'
const fakerRouting = '.faker'
const fakerEx = 'r2_faker'

const FINISH = 1
const SEND = 2

const mq = async (command, callback, faker = false) => {
  try {
    const conn = await amqp.connect('amqp://localhost')
    console.log("mq connect")

    const server = faker ? await initServer(conn) : { close: () => { } }
    const client = await initClient(conn, faker)
    return client.send(command, callback).then(result => {
      client.close()
      server.close()
      console.log(result, "result")
      return result
    })
  } catch (e) {
    const error = {
      status: -99,
      message: e.message
    }
    return callback ? callback(error) : error
  }
}

initClient = async (conn, faker) => {
  const ch = await conn.createChannel()

  // sub
  await ch.assertExchange(subEx, 'topic', { durable: true })
  // await ch.deleteQueue(subQueue)
  await ch.assertQueue(subQueue)
  await ch.bindQueue(subQueue, subEx, '*' + subRouting)

  //pub
  const ex = faker ? fakerEx : pubEx
  const routing = faker ? fakerRouting : pubRouting
  await ch.assertExchange(ex, 'fanout', { durable: true })

  ch.on("close", () => {
    console.log("client close")
  })

  const send = (msg, callback) => {
    const corr = msg.requestId
    return new Promise(resolve => {
      ch.consume(subQueue, async msg => {
        if (!msg) return
        console.log("client consume");
        const { content, properties: { correlationId }, header = {} } = msg
        if (correlationId === corr) {
          if (header.r2Delete) {
            return close()
          }
          let data = content.toString()
          try {
            data = JSON.parse(data)
          } catch (e) { }
          if (!callback) return resolve(data)
          const result = await callback(data)
          if (result) return resolve(result)
        }
      }, { noAck: true })
      ch.publish(ex, '*' + routing, Buffer.from(JSON.stringify(msg)), { correlationId: corr })
    })
  }
  const close = () => {
    ch.ackAll()
    ch.close()
  }
  return {
    send,
    close
  }
}

initServer = async (conn) => {
  const ch = await conn.createChannel()

  // pub
  await ch.assertExchange(subEx, 'topic', { durable: true })
  await ch.assertExchange(fakerEx, 'fanout', { durable: true })
  // await ch.deleteQueue(fakerQueue)
  await ch.assertQueue(fakerQueue)
  await ch.bindQueue(fakerQueue, fakerEx, fakerQueue + fakerRouting)

  ch.on("close", () => {
    console.log("server close")
  })

  ch.consume(fakerQueue, msg => {
    if(!msg) return
    console.log("server consume")
    const { content, properties: { correlationId } } = msg
    const fakerCallback = (msg) => {
      console.log("faker publish")
      ch.publish(subEx, 'test' + subRouting, Buffer.from(JSON.stringify(msg)), { correlationId })
    }
    let data = content.toString()
    try {
      data = JSON.parse(data)
    } catch (e) { }
    console.log(data, "send to command!!!!")
    command(data, fakerCallback)
    // ch.ack(msg)
  }, { noAck: true })
  const send = (correlationId) => {
    ch.publish(subEx, 'test' + subRouting, '', { correlationId, header: { r2Delete: true } })
  }
  const close = () => {
    ch.ackAll()
    ch.close()
  }
  return {
    send,
    close
  }
}

clearListener = async requestId => {
  try {
    const conn = await amqp.connect('amqp://localhost')
    const server = await initServer(conn)
    server.send(requestId)
  } catch (e) {
    return
  }
}

mq.FINISH = FINISH
mq.SEND = SEND
mq.clearListener = clearListener

module.exports = mq

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