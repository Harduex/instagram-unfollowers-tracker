FROM node:18-alpine

# update
RUN apk update
RUN apk upgrade
RUN apk add ca-certificates && update-ca-certificates

# Change TimeZone
RUN apk add --update tzdata
ENV TZ=Europe/Sofia

# Clean APK cache
RUN rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY ./src ./src

RUN npm install
RUN rm -rf ./dist
RUN npm run build && rm -rf ./src

EXPOSE 8080
CMD [ "npm", "start" ]