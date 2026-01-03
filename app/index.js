const express = require('express');
const client = require('prom-client');
const fs = require('fs');
const app = express();
const port = 3000;

// Logger simple
const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: './logs/app.log' })
  ]
});

// Métricas Prometheus
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get('/', (req, res) => {
  logger.info('Root accessed');
  res.send('App OK');
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
