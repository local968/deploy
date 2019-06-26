FROM node:12-stretch-slim
COPY . /app
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cd /app && cnpm install --production
CMD cd /app; npm run start;
