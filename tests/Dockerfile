FROM node:8

COPY ./package.json ./package-lock.json /
COPY ./helpers /helpers
COPY ./spec /spec
RUN npm install --silent
