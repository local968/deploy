## System Environment
PORT = 8080 || process.env.PORT
Webserver port   

FRONTEND_PORT = PORT || process.env.FRONTEND_PORT   
如果后端对外接口并非第一项中的PORT(如nginx转发) 则需要使用该参数调整前端连接到后端的接口   

BACKEND_PORT = PORT || process.env.BACKEND_PORT   
后端端口单独设置   

NGINX_PORT
Nginx 上传服务器端口

NGINX_BACKEND = 1 || process.env.NGINX_BACKEND   
nginx backend   

SECRET = 'FNcidLwifNC902LCC9f2C' || process.env.SECRET   
session 密码验证 上传验证 都用到了改secret   

REDIS_SENTINEL_HOSTS = process.env.REDIS_SENTINEL_HOSTS || '192.168.0.3:16390,192.168.0.3:16391,192.168.0.3:16392'
redis 哨兵模式的N个地址，以逗号分隔   

REDIS_USERNAME = 'redismaster' || process.env.REDIS_USERNAME   
redis 用户名   

REDIS_PASSWORD = 'redis123321eq' || process.env.REDIS_PASSWORD   
redis密码   

REQUEST_QUEUE = 'taskQueue' || process.env.REQUEST_QUEUE   
redis 任务请求队列名称   

RESULT_QUEUE = 'resultDataQueue' || process.env.RESULT_QUEUE   
redis 任务结果队列名称   

QUEUE_PERIOD = 60 || process.env.QUEUE_PERIOD   
队列循环周期(秒)   

SCHEDULE_PERIOD = 60 || process.env.SCHEDULE_PERIOD   
计划任务循环周期(秒)   

MAX_CONCURRENCY_SCHEDULE = 2 || process.env.MAX_CONCURRENCY_SCHEDULE   
最大并发计划任务
