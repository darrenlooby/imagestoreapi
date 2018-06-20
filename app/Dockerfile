FROM node:8

COPY ./controllers /controllers
COPY ./lib /lib
COPY ./service /service
COPY ./temp /temp
COPY ./package.json /
COPY ./package-lock.json /

COPY ./index.js /
COPY ./swagger.yaml /

RUN npm install nodemon -g --silent
RUN npm install --silent
