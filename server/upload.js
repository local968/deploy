const { Router } = require('express');

const router = new Router();

router.post("/", (req, res) => {
    // locate file path
    const {userId, projectId, size, isFirst, filename, start} = req.query;
    // const projPath = path.resolve(__dirname, '../..');
    const filePath = path.join(config.projPath, 'data', userId, projectId);
    const uploadFile = path.join(filePath, filename);
  
    //创建文件夹
    if (!fs.existsSync(filePath)) {
        createFilePath(filePath)
    }
  
    let n, filesize;
    try{
        n = parseInt(start, 10);
        filesize = parseInt(size, 10);
    }catch(e){
        return res.status(500).json({message: "error params"});
    }
    
    //存在这区检验文件大小
    if (isFirst && fs.existsSync(uploadFile)){
        const stat = fs.statSync(uploadFile);

        if(stat.size > n){
            let returnData = {
                status: 200,
                msg: "ok",
                isFirst: false,
                nextChunk: stat.size
            }
            res.json(returnData);
            return;
        }
    }
  
    const form = new multiparty.Form({uploadDir: filePath});
    form.parse(req, function(err) {
      
    });
   
    form.on('file', function(name, file) {
        try{
            fs.readFile(file.path, (err, data) => {
                if (err) return res.status(500).json({message: err});
                fs.appendFileSync(uploadFile, data);
                fs.unlinkSync(file.path);
                let returnData = {
                    status: 200,
                    msg: "ok",
                    isFirst: false,
                    nextChunk: n + filesize
                }
                res.json(returnData);
            })
        }catch(e){
            return res.status(500).json({message: e});
        }
    });
});


function parse(str) {
    var matches;

    if (typeof str !== "string") return null;

    if (matches = str.match(/^(\w+) (\d+)-(\d+)\/(\d+|\*)/)) return {
        unit: matches[1],
        first: +matches[2],
        last: +matches[3],
        length: matches[4] === '*' ? null : +matches[4]
        };

    if (matches = str.match(/^(\w+) \*\/(\d+|\*)/)) return {
        unit: matches[1],
        first: null,
        last: null,
        length: matches[2] === '*' ? null : +matches[2]
        };

    return null;
}

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
