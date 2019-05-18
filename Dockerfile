FROM node:11.14.0-alpine
COPY . /app
RUN cd /app && npm install --production
CMD cd /app; npm run start;
