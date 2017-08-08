FROM node:latest
MAINTAINER SushiFu <SushiFu@gmx.fr>

WORKDIR /app
COPY . /app

RUN yarn install && \
    yarn build && \
    yarn install --prod

CMD ["node", "./dist/server.js"]