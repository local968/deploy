const express = require('express');
const config = require('../config.js');
const path = require('path');
const fs = require('fs');
const upload = require('./uploader');
const Download = require('./download');
const multiparty = require('multiparty');

const app = express();

app.get('/test', (req, res) => {
  res.send('ok');
});

const port = parseInt(config.port);
httpServer = app.listen(port, '0.0.0.0', err => {
  if (err) {
    console.log(err, port); // eslint-disable-line
    return;
  }

  console.log(`Website server listening at http://${config.host}:${port}`); // eslint-disable-line
});

app.use(express.static(path.join(process.cwd(), 'build')));
// app.use('/api/upload', upload);


app.post('/api/sample', (req, res) => {
  const {type, filename, userId, projectId} = req.query;
  const projPath = path.resolve(__dirname, '..');
  const samplePath = path.join(projPath, 'sample', type, filename);
  const filePath = path.join(config.projPath, 'data', userId, projectId);

  if (!fs.existsSync(filePath)) {
    createFilePath(filePath)
  }

  fs.link(samplePath, path.join(filePath, filename), err => {
    if (err && !err.message.startsWith('EEXIST')) return res.status(500).json({message: err});
    return res.json({message: 'sample copy finished'});
  })
});

app.post('/api/upload', (req, res) => {
  // locate file path
  const {userId, projectId, start, filename, size, isFirst} = req.query;
  // const projPath = path.resolve(__dirname, '../..');
  const filePath = path.join(config.projPath, 'data', userId, projectId);
  const uploadFile = path.join(filePath, filename);
  console.log("start upload")
  //创建文件夹
  if (!fs.existsSync(filePath)) {
    createFilePath(filePath)
  }

  let n, filesize
  try{
    n = parseInt(start, 10);
    filesize = parseInt(size, 10);
  }catch(e){
    res.status(500).json({message: e});
  }

  if (isFirst && fs.existsSync(uploadFile)){
    console.log("check upload")
    const stat = fs.statSync(uploadFile);
    
    //大于文件大小的块才开始写入
    if(stat.size > n){
      let returnData = {
        status: 200,
        msg: "ok",
        size: stat.size,
        isFirst: false
      }
      res.json(returnData);
      return 
    }
  }

  const form = new multiparty.Form({uploadDir: filePath});
 
  form.parse(req)

  form.on('file', function(name, file) {
    try{
       //读取文件数据
      fs.readFile(file.path, (err, data) => {
        if (err) return res.status(500).json({message: err});
        fs.open(uploadFile, 'w', (err2, fd) => {
          if(err2) return res.status(500).json({message: err2});
          fs.writeSync(fd, data, 0, filesize, n);
          //删除块文件
          fs.unlinkSync(file.path);

          let returnData = {
            status: 200,
            msg: "ok",
            size: n + filesize,
            isFirst: false
          }
          res.json(returnData);
        })
        //写入文件最后
        // fs.appendFileSync(uploadFile, data);
        return 
      })
    }catch(e){
     res.status(500).json({message: e});
      return
    }
  });

  
});


app.get('/api/download', (req,res) => {
  const {userId, projectId, csvLocation} = req.query;
  const file = path.join(config.projPath, 'data', userId, projectId, csvLocation);
  res.download(file)
})

app.get('/api/read', (req,res) => {
  const {userId, projectId, csvLocation} = req.query;
  const file = path.join(config.projPath, 'data', userId, projectId, csvLocation);
  const download = new Download(req ,res);
  download.download(file, csvLocation);
})

app.get('/api/makemd5', (req,res) => {
  const {userId, projectId, csvLocation} = req.query;
  const file = path.join(config.projPath, 'data', userId, projectId, csvLocation);
  const download = new Download(req ,res);
  download.makemd5(file, csvLocation);
})

const createFilePath = (filePath) => {
  let dirArr = filePath.split(path.sep);
  dirArr.reduce((prev, current) => {
    if(!prev){
      prev = path.sep;
    }
    let currentPath = path.join(prev, current);
    if(!fs.existsSync(currentPath)){
      fs.mkdirSync(currentPath);
    }
    return currentPath;
  });
}

// CRA routing
app.get('/*', function(req, res) {
  const index = path.join(process.cwd(), 'build', 'index.html');
  if(fs.existsSync(index)) {
    res.sendFile(index);
  }
});