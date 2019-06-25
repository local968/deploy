# 基础
## 文件结构
```
.vscode
node_modules
public  //静态目录
sample  //样例数据
server  //服务端源码
src     //客户端源码
static  //公开目录
config-overrides.js //react-app-rewired配置文件
config.ts //项目配置文件
deploy2-dev.json  //dev模式后端pm2启动文件
deploy2.json  //production模式后端pm2启动文件
Dockerfile
package.json
README.md
upload.conf
```
还有一些未列出的其他配置文件文档文件等。

## 技术选型
总体上沿用1.0的主要技术模块，但对所有开源依赖模块进行了更新，并且未来也会定期和这些模块的最新版本保持同步。   
主要模块:   
* [react](https://github.com/facebook/react)
* [create-react-app](https://github.com/facebook/create-react-app)
* [react-app-rewired](https://github.com/timarney/react-app-rewired)
* [mobx](https://github.com/mobxjs/mobx)
* [ant-design](https://github.com/ant-design/ant-design)
* [d3](https://github.com/d3/d3)
* [react-virtualized](https://github.com/bvaughn/react-virtualized)
* [axios](https://github.com/axios/axios)
* [express](https://github.com/expressjs/express)
* [ioredis](https://github.com/luin/ioredis)

# 数据流
## 前端部分

![basic](http://ty.dnnmind.com/static/basic.png)
![circle](http://ty.dnnmind.com/static/circle.png)

SocketStore.js   
维护websocket连接   
初始化API
```
import socketStore from 'stores/SocketStore';
async function train() {
  const api = await socketStore.ready()
  const result = await api.train({projectId:1, ...})
}
```

## 后端部分
### 和前端通讯数据流
webSocket.js   
```
type Progress = (data: Object): False
type WssListener = (message: Object, socket: Socket, progress: Progress)
wss.register = (eventName:string, listener:WssListener):void
```


### 和计算节点通讯数据流
![bbasic](http://ty.dnnmind.com/static/bbasic.png)
![bcircle](http://ty.dnnmind.com/static/bcircle.png)
command.js
```
type ProgressCallback = (progressResult: Object): Boolean
command = (commandData: Object, progressCallback?:ProgressCallback):Promise
```
ProgressCallback的返回值控制 command 返回的Promise的状态   
当ProgressCallback 不存在时 接收到第一个结果后就resolve command返回的Promise

```
wss.register('train',(message, socket, progress) => {
  return command({ ...message, userId, requestId: message._id }, progressResult => {
    if (progressResult.status < 0 || progressResult.status === 100) {
      return progressResult
    }
    return progress(progressResult)
  })
})
```

### 目前的问题
* 服务器重启丢数据
* 分布式WebServer
* 健壮性

# 用户端配置
## 前端部分
```
process.env.REACT_APP_FRONTEND_HOST || window.location.hostname
// 前端使用该地址连接到后端服务器

process.env.REACT_APP_FRONTEND_PORT || '8080'
// 前端页面使用该接口连接到后端服务器

process.env.REACT_APP_NGINX_BACKEND || 1
// 无需修改 但在nginx配置内需要主要 有 backend1 的对应配置

```

## 后端部分
```
process.env.BACKEND_PORT || '8080'
// 后端服务启动端口

process.env.REDIS_USERNAME || 'redismaster'
process.env.REDIS_PASSWORD || 'redis123321eq'
// redis 账户名密码

process.env.REDIS_TYPE || 1 // 1 standalone 2 sentinel
// redis 连接模式 1->单机模式 2->哨兵模式 

process.env.REDIS_SENTINEL_HOSTS || '192.168.0.23:16390,192.168.0.23:16391,192.168.0.23:16392'
// redis 哨兵模式下连接信息 
const REDIS_HOST = process.env.REDIS_HOST || '192.168.0.23:6376'
// redis 单机模式下连接信息

process.env.SECRET || 'FNcidLwifNC902LCC9f2C'
// Secret
```

## 后端细节配置
```
process.env.REQUEST_QUEUE || 'taskQueue'
// redis request queue name

process.env.RESULT_QUEUE || 'resultDataQueue'
// redis result queue name

process.env.SCHEDULE_PERIOD || '60'
// schedule 检测周期

process.env.SECRET || 'FNcidLwifNC902LCC9f2C'
// secret
```
