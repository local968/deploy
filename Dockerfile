FROM node:12-stretch-slim
COPY . /app
RUN cd /app && npm install --production
CMD cd /app; npm run start;
