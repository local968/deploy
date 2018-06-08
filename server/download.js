const path = require("path");
const fs = require("fs");
const crypto = require('crypto');

const Download = function(req, res) {
    Download.req = req;
    Download.res = res;
    return Download;
}

Download.calStartPosition = function(range) {
    let startPos = 0;
    if( typeof range != 'undefined') {
        let startPosMatch = /^bytes=([0-9]+)-$/.exec(range);
        startPos = Number(startPosMatch[1]);
    }
    return startPos;
}

Download.configHeader = function(config) {
    let self = this;
    let startPos = config.startPos, 
        fileSize = config.fileSize,
        res = self.res,
        filename = self.filename;
    // 如果startPos为0，表示文件从0开始下载的，否则则表示是断点下载的。
    if(startPos == 0) {
        res.setHeader('Accept-Range', 'bytes');
    } else {
        res.setHeader('Content-Range', 'bytes ' + startPos + '-' + (fileSize - 1) + '/' + fileSize);
    }
    //206, 'Partial Content', 
    res.set({
        'Content-Type' : 'application/octet-stream',
        "Content-Disposition":"attachment;filename="+encodeURI(filename)
    });
}

Download.init = function(filePath, callback) {
    let config = {};
    let self = this;
    fs.stat(filePath, function(error, state) {
        if(error)
            throw error;

        config.fileSize = state.size;
        let range = self.req.headers.range;
        config.startPos = self.calStartPosition(range);
        self.config = config;
        self.configHeader(config);
        callback();
    });
}

Download.download = function(filePath, filename) {
    let self = this;
    self.filename = filename

    fs.exists(filePath, function(exist) {
        if(exist) {
            self.init(filePath, function() {
                
                let config = self.config
                    res = self.res,
                    hash = crypto.createHash('md5');
                fReadStream = fs.createReadStream(filePath, {
                    encoding : 'binary',
                    bufferSize : 1024 * 1024,
                    start : config.startPos,
                    end : config.fileSize
                });
                fReadStream.on('data', function(chunk) {
                    res.write(chunk, 'binary');
                    hash
                });
                fReadStream.on('end', function() {
                    res.end();
                });
            });
        } else {
            console.log('文件不存在！');
            return;
        }
    });
}

Download.sign = function(filePath) {
    let self = this;
    fs.exists(filePath, function(exist) {
        if(exist) {
            let hash = crypto.createHash('md5');
            let res = self.res;
            let rs = fs.createReadStream(filePath);
            rs.on('data', hash.update.bind(hash));
            rs.on('end', function () {
                res.json({
                    status: 200,
                    msg: "ok",
                    hash: hash.digest('hex')
                });
            });
        } else {
            console.log('文件不存在！');
            return;
        }
    });
}

module.exports = Download;