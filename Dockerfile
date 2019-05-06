FROM node:11.14.0-alpine
COPY . /app
RUN cd /app && yarn --production --ignore-engines
CMD cd /app; yarn start;
