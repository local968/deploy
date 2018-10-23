FROM node
COPY . /r2
RUN cd /r2 && npm i && npm i -g pm2
CMD /bin/bash -c "cd r2 && npm run build && pm2 start deploy2.json"
