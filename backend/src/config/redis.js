const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URI);

redis.on('connect', () => {
  console.log('Redis Connected');
});

redis.on('error', (err) => {
  console.error(`Redis connection error: ${err}`);
});

module.exports = redis;
