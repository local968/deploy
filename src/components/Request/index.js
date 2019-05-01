import request from "superagent";

const get = (url) => {
  return new Promise((resolve, reject) => {
    request
      .get(url)
      .redirects(0)
      .end(function(err, res) {
        if (err || !res.ok) {
          reject(err);
        } else {
          resolve(JSON.parse(res.text));
        }
      });
  });
};

const post = (params) => {
  const { url = "", data = {} } = params;

  return new Promise((resolve, reject) => {
    request
      .post(url)
      .send(data)
      .set("Content-Type", "application/json; charset=utf-8")
      .redirects(0)
      .end(function(err, res) {
        if (err || !res.ok) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
  });
};

export default {
  get,
  post
};

// function Get(url){
//   request
//   .get(url)
//   .redirects(0)
//   .end(function(err, res){
//     if (err || !res.ok) {
//       console.log('Oh no! error');
//     } else {
//       console.log('yay got ' + JSON.stringify(res.body));
//     }
//   });
// }

// request
//   .get('http://139.224.132.44:9200/test/_search')
//   .redirects(0)
//   .end(function(err, res){
//     if (err || !res.ok) {
//       console.log('Oh no! error');
//     } else {
//       console.log('yay got ' + JSON.stringify(res.body));
//     }
//   });
