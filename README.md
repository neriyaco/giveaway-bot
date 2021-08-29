# giveaway-bot
Discord giveaway bot

## Usage
Log into your heroku account
```
heroku login
```
Change settings in config.json
```json
{
    "token": "BOT_TOKEN",
    "prefix": "$",
    "giveawayManagerRoles": [
        "Giveaways Manager"
    ],
    "mongoURL": "MONGO_URL",
    "commandGainExp": true,
    "serverBoosterRole": "Server Booster"
}
```
Set mongo username and password in Dockerfile
```Dockerfile
FROM node:16-alpine
ENV NODE_ENV=production
ENV MONGO_USER=username <-- Change this value
ENV MONGO_PASS=password <-- Change this value
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY ./dist .
EXPOSE 3000
CMD ["npm", "start"]
```

build and deploy
```
npm run heroku-run
```
