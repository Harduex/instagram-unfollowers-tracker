FROM node:18-alpine

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