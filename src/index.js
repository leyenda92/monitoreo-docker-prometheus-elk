const express = require('express')
const client = require('prom-client')
const winston = require('winston')

const app = express()
const port = 3000

const collectDefaultMetrics = client.collectDefaultMetrics
collectDefaultMetrics()

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP',
  labelNames: ['method', 'route', 'status']
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log' }),
    new winston.transports.Console()
  ]
})

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    })
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode
    })
  })
  next()
})

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.end(await client.register.metrics())
})

app.listen(port, () => {
  logger.info(`App running on port ${port}`)
})
