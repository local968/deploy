import { redis } from '../redis';
import moment from 'moment';
import express from 'express';
import uuid from 'uuid';
import crypto from 'crypto';
import command from '../command';
import api from '../scheduleApi';
const { restriction } = require("../apis/service/planService");
import wss from '../webSocket';
import Papa from 'papaparse';
import config from '../../config';
import axios from 'axios';
import _ from 'lodash';

const etlServicePath = config.services.ETL_SERVICE;
const router = express.Router();

router.get('/:projectId/clean', async (req, res) => {
  const token = req.query.token || uuid.v4()
  const scroll = req.query.scroll || '1'
  const size = req.query.size || 5000
  const projectId = req.params.projectId
  if(!projectId) return res.status(400).json({error: 'need project id'})
  try {
    let scroll_id = await redis.get('FetchCleanData:' + token)
    let requestBody
    if (scroll_id) {
      requestBody = { setting: { scroll: scroll + 'm', scroll_id } }
      res.setHeader('scroll_id', scroll_id)
    } else {
      const [originalIndex, etlIndex] = (await redis.hmget(`project:${projectId}`, 'originalIndex', 'etlIndex')).map(JSON.parse)
      requestBody = {
        setting: { originalIndex, etlIndex, scroll: scroll + 'm' },
        size
      }
    }
    const response = await axios.post(`${etlServicePath}/etls/api/fetch`, requestBody)
    if (response.status !== 200) return res.status(response.status).json(response.data)
    const data = response.data.data
    scroll_id = response.data.scroll_id
    await redis.set('FetchCleanData:' + token, scroll_id, 'EX', scroll * 60)
    res.setHeader('token', token)
    return res.json(data)
  } catch (e) {
    console.error(e)
    return res.status(400).json({
      error: 'get clean data error',
      status: 400
    })
  }
})

export default router