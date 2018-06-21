'use strict';

const mongoose = require('mongoose');

const { logger } = require('../helpers/log');

mongoose.Promise = global.Promise;
try {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/lighthouse_message', {
    useMongoClient: true,
  });
} catch (e) {
  logger.error('already connected to mongoose');
}

const Message = require('./conversation');
const User = require('./user');

module.exports = {
  Message,
  User,
};
