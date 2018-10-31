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
