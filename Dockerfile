FROM node:11.14.0-alpine
COPY . /r2
RUN cd /r2 && yarn --ignore-engines && npm i -g pm2
CMD /bin/bash -c "cd r2 && npm run build && pm2-runtime start deploy2.json"
