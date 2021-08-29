FROM node:16-alpine
ENV NODE_ENV=production
ENV MONGO_USER=giveaway
ENV MONGO_PASS=XnQU6mle7ttyL6ZO
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY ./dist .
EXPOSE 3000
CMD ["npm", "start"]
