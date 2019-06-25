import { redis } from './redis';
import { Router } from 'express';
import config from '../config';

const router = Router();
const nodeId = 1;

// fake socket
const fakeSocket = {
  send: () => {},
  session: { userId: 1 },
};

export const saveMessage = async (message, user) => {
  // message.user = user
  // message = JSON.stringify(message)
  // const id = crypto.createHash('md5').update(message).digest('hex')
  // const key = `message:${id}`
  // const exist = await redis.exists(key)
  // if (exist) return
  // const pipeline = redis.pipeline()
  // pipeline.set(key, message)
  // pipeline.sadd(`node:${nodeId}:messages`, key)
  // return pipeline.exec()
};

export const removeMessage = async (message, user) => {
  // message.user = user
  // message = JSON.stringify(message)
  // const id = crypto.createHash('md5').update(message).digest('hex')
  // const key = `message:${id}`
  // const pipeline = redis.pipeline()
  // pipeline.del(key)
  // pipeline.srem(`node:${nodeId}:messages`, key)
  // return pipeline.exec()
};

const init = async wss => {
  // try {
  //   await command({
  //     command: 'clearWaitingQueue',
  //     projectId: '-1',
  //     userId: 'user',
  //     requestId: "requestId"
  //   })
  // } catch (e) {
  //   console.log(e.message)
  // }
  // const emits = []
  // let left = await redis.scard(`node:${nodeId}:messages`)
  // if (left === 0) return
  // while (left > 0) {
  //   try {
  //     const messageId = await redis.spop(`node:${nodeId}:messages`)
  //     const message = JSON.parse(await redis.get(messageId))
  //     console.log(`recovering ${messageId}:`, message)
  //     const user = message.user
  //     const socket = { ...fakeSocket, session: { userId: user.id, user } }
  //     await redis.del(messageId)
  //     emits.push(['message', socket, JSON.stringify(message)])
  //   } catch (e) {
  //     console.error('message recover failed', e)
  //   }
  //   left = await redis.scard(`node:${nodeId}:messages`)
  //   console.log('left:', left)
  // }
  // emits.forEach(args => wss.emit(...args))
};

router.get('/status', async (req, res) => {
  if (req.query.password !== config.PASSWORD) return res.status(404).end();
  const left = await redis.scard(`node:${nodeId}:messages`);
  res.json({ left });
});

router.get('/clear', async (req, res) => {
  if (req.query.password !== config.PASSWORD) return res.status(404).end();
  const keys = await redis.smembers(`node:${nodeId}:messages`);
  const result = await redis.del(...keys, `node:${nodeId}:messages`);
  const left = await redis.scard(`node:${nodeId}:messages`);
  res.json({ result, left, keys });
});

router.get('/clearProjectModels', async (req, res) => {
  if (req.query.password !== config.PASSWORD) return res.status(404).end();
  const keys = await redis.smembers(`project:${req.query.id}:models`);
  const result = await redis.del(...keys, `project:${req.query.id}:models`);
  res.json({ status: 'ok' });
});

export const messageRouter = router;
export const recover = init;
