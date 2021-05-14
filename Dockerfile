FROM node:14-alpine
WORKDIR /usr/src/app
COPY ["package.json", "./"]
RUN npm install
RUN npm run build
RUN mv node_modules ../
COPY . .
EXPOSE 3000
CMD npm run start
