const fs = require("fs");
const crypto = require("crypto");

class Download {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    calStartPosition(range) {
        let startPos = 0;
        if( typeof range != 'undefined') {
            let startPosMatch = /^bytes=([0-9]+)-$/.exec(range);
            startPos = Number(startPosMatch[1]);
        }
        return startPos;
    }
    
    configHeader(config) {
        
        let startPos = config.startPos, 
            fileSize = config.fileSize,
            res = this.res,
            filename = this.filename;
        // 如果startPos为0，表示文件从0开始下载的，否则则表示是断点下载的。
        if(startPos == 0) {
            res.setHeader('Accept-Range', 'bytes');
        } else {
            res.setHeader('Content-Range', 'bytes ' + startPos + '-' + (fileSize - 1) + '/' + fileSize);
        }
        //206, 'Partial Content', 
        res.set(206, 'Partial Content', {
            'Content-Type' : 'application/octet-stream',
            "Content-Disposition":"attachment;filename="+encodeURI(filename)
        });
    }
    
    init(filePath, callback) {
        let config = {};
        fs.stat(filePath, (error, state) => {
            if(error)
                throw error;
    
            config.fileSize = state.size;
            let range = this.req.headers.range;
            config.startPos = this.calStartPosition(range);
            this.config = config;
            this.configHeader(config);
            callback();
        });
    }
    
    download(filePath, filename) {
        this.filename = filename
    
        fs.exists(filePath, (exist) => {
            if(exist) {
                this.init(filePath, () => {
                    let config = this.config,
                        res = this.res,
                    fReadStream = fs.createReadStream(filePath, {
                        encoding : 'binary',
                        bufferSize : 1024 * 1024,
                        start : config.startPos,
                        end : config.fileSize
                    });
                    fReadStream.on('data', (chunk) => {
                        res.write(chunk, 'binary');
                    });
                    fReadStream.on('end', () => {
                        res.end();
                    });
                });
            } else {
                console.log('文件不存在！');
                return;
            }
        });
    }
    
    makemd5(filePath) {
        fs.exists(filePath, (exist) => {
            if(exist) {
                let hash = crypto.createHash('md5');
                let res = this.res;
                let rs = fs.createReadStream(filePath);
                rs.on('data', hash.update.bind(hash));
                rs.on('end', () => {
                    res.json({
                        status: 200,
                        msg: "ok",
                        hash: hash.digest('hex')
                    });
                });
            } else {
                this.res.json({
                    status: 200,
                    msg: "ok",
                    hash: ""
                });
                return;
            }
        });
    }
}

module.exports = Download;