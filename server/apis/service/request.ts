import request from 'superagent'
import config from '../../../config'
const {STRAPI_TOKEN} = config;

const get = (url)=>{
  console.log(url,STRAPI_TOKEN)
  return new Promise((resolve,reject)=>{
    let req = request.get(url);
    if(STRAPI_TOKEN){
      req = req.set('Authorization', `Bearer ${STRAPI_TOKEN}`)
    }

    req.redirects(0)
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
    let req = request.post(url);
    if(STRAPI_TOKEN){
      req = req.set('Authorization', `Bearer ${STRAPI_TOKEN}`)
    }
    req.send(data)
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
    let req = request.put(url);
    if(STRAPI_TOKEN){
      req = req.set('Authorization', `Bearer ${STRAPI_TOKEN}`)
    }
    req.send(data)
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
