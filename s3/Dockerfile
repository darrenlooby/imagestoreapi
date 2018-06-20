FROM node:8

COPY ./package.json ./package-lock.json /
COPY ./index.js /
RUN npm install --silent

ENTRYPOINT ["npm", "run"]
CMD ["start"]
