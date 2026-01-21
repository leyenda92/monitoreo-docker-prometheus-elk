FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install -g pm2

COPY . .

RUN mkdir -p logs

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]
