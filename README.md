# instagram-unfollowers-tracker

Node.js telegram bor for tracking instagram unfollowers

## .env
```
touch .env
```

### In chrome:

```
DS_USER_ID=
```

- go to instagram.com
- log in
- click F12
- go to "Application" tab
- extend "cookies" menu intem on the left
- click on the item inside
- search for "ds_user_id" cookie and copy it's value

### In chrome:

```
COOKIE=
```

- go to instagram.com
- log in
- click F12
- go to "Network" tab
- clear results
- go to your profile
- refresh page
- scroll to top in new results
- click on first result
- on the right window, click "Headers"
- scroll to find header named "cookie"
- right click it and "copy value"

TELEGRAM_BOT_TOKEN=your_telegram_bot_token

## Usage

```
$ npm i
$ npm start
```

## Build docker image (optional)

```
docker build . -t harduex/instagram-unfollowers-telegram-bot
```

### then docker run

```
docker run -it -d -v instagram-unfollowers-volume:/app/data --env-file .env harduex/instagram-unfollowers-telegram-bot
```

## or docker-compose

```
docker-compose up -d
```
