const express = require('express')
const redis = require('redis');
const {RateLimiterRedis} = require('rate-limiter-flexible');

const redisClient = redis.createClient({
  host: 'redis',
  port: 6379,
  enable_offline_queue: false,
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10, // 10 requests
  duration: 1, // per 1 second by IP
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send('Too Many Requests');
    });
};

const app = express()
const port = 3000

app.use(rateLimiterMiddleware);
app.get('/', (req, res) => {
  res.send('Hello World2!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})