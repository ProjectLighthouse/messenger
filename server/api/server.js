/* eslint global-require: 0 */

'use strict';

if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const express = require('express');

const app = express();
//eslint-disable-next-line
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.API_PORT || 8000;

require('./set-middleware')(app);
require('./set-routes')(app);

const { logger } = require('./helpers/log');

app.use('/', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

io.on('connection', function (socket) {
  console.log('socket.io connection made');
});

global.io = io;

http.listen(port, function () {
  logger.info(`Started Project Lighthouse Rest API - listening on ${port}`);
});

