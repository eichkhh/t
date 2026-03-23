#!/usr/bin/env node
const http = require('http');

const port = process.argv[2] || process.env.HEALTH_PORT || '3001';
const path = process.env.HEALTH_PATH || '/health';

const req = http.get(
  {
    hostname: '127.0.0.1',
    port: Number(port),
    path,
    timeout: 5000,
  },
  (res) => {
    res.resume();
    res.on('end', () => {
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
  },
);

req.on('error', () => process.exit(1));
req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});
