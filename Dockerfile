FROM node:6.9

COPY . /usr/service/
WORKDIR /usr/service
RUN npm install --production

EXPOSE 8080
CMD [ "npm", "start" ]
