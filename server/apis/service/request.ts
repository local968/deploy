import request from 'superagent'
import config from '../../../config'

const get = (url,query={})=>{
  return new Promise((resolve,reject)=>{
     request.get(url)
      .redirects(0)
       .query(query)
      .end(function(err, res){
        if (err || !res.ok) {
          console.log(err)
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
    request.post(url)
      .send(data)
      .set('Content-Type', 'application/json; charset=utf-8')
      .redirects(0)
      .end(function(err, res){
        if (err || !res.ok) {
          console.log(err);
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
    request.put(url).send(data)
      .set('Content-Type', 'application/json; charset=utf-8')
      .redirects(0)
      .end(function(err, res){
        if (err || !res.ok) {
          console.log(err);
          reject(err)
        } else {
          resolve(res.body);
        }
      });
  })
};

const _delete = (url)=>{
  return new Promise((resolve,reject)=>{
    request.del(url).redirects(0)
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
  delete:_delete,
}
