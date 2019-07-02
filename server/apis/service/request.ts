import request from 'superagent'
import config from '../../../config'
const {STRAPI_TOKEN} = config;

const get = (url)=>{
  return new Promise((resolve,reject)=>{
    request.get(url)
      .set('Authorization', `Bearer ${STRAPI_TOKEN}`)
      .redirects(0)
      .end(function(err, res){
        if (err || !res.ok) {
          resolve();
        } else {
          resolve(res.body);
        }
      });
  })
};

const post = (params)=>{
  const {
    url='',
    data={},
  } = params;

  return new Promise((resolve,reject)=>{
    request
      .post(url)
      .set('Authorization', `Bearer ${STRAPI_TOKEN}`)
      .send(data)
      .set('Content-Type', 'application/json; charset=utf-8')
      .redirects(0)
      .end(function(err, res){
        if (err || !res.ok) {
          reject(err)
        } else {
          resolve(res.body);
        }
      });
  })
};

const put = (params)=>{
  const {
    url='',
    data={},
  } = params;

  return new Promise((resolve,reject)=>{
    request
      .put(url)
      .set('Authorization', `Bearer ${STRAPI_TOKEN}`)
      .send(data)
      .set('Content-Type', 'application/json; charset=utf-8')
      .redirects(0)
      .end(function(err, res){
        if (err || !res.ok) {
          reject(err)
        } else {
          resolve(res.body);
        }
      });
  })
};

export default {
  get,
  post,
  put,
}
