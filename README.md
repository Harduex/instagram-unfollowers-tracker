# instagram-unfollowers-tracker
Node.js telegram bot for tracking instagram unfollowers

## .env
```
touch .env
```

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
- click on first result (www.instagram.com)
- on the right window, click "Headers"
- scroll to find header named "cookie"
- right click it and "copy value"

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
INSTAGRAM_USERNAME=your_instagram_username

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
