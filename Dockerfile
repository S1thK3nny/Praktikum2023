FROM node:19

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]
