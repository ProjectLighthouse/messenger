'use strict';

const uuidV1 = require('uuid/v1');
const crypto = require('crypto');
const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const passportLocalMongoose = require('passport-local-mongoose');
const { logger } = require('../helpers/log');

const Schema = mongoose.Schema;

const API_KEYS_MAX = 4;

const User = mongoose.model('User', new Schema({
  emailAddress: String,
  hash: {
    select: false,
    type: String,
  },
  salt: {
    select: false,
    type: String,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  authentication: {
    apiKeys: [{
      token: {
        type: String,
      },
            // TODO: IAM style access rights like "opportunities:read", "opportunities:write", etc
      scope: [{
        enum: ['all'],
        type: String,
      }],
    }],
    google: {
      select: false,
      authenticationToken: String,
      googleId: String,
    },
    facebook: {
      select: false,
      accessToken: String,
      facebookId: String,
    },
    select: false,
  },
}, {
  usePushEach: true,
}).plugin(timestamps).plugin(passportLocalMongoose, {
  usernameField: 'emailAddress',
  iterations: (process.env.HASH_ITERATIONS ? parseInt(process.env.HASH_ITERATIONS, 10) : 25000),
}));

function registerUser(volunteer, password) {
  return new Promise((resolve, reject) => {
    User.register(volunteer, password, function (err) {
      if (err) {
        return reject(err);
      }

      return resolve(volunteer);
    });
  });
}

function createToken() {
  return new Promise((res, rej) => {
    crypto.randomBytes(20, function (err, buf) {
      if (err) {
        return rej(err);
      }
      const token = buf.toString('hex');
      return res(token);
    });
  });
}

module.exports = Object.assign(User, {
  logPasswordReset(user) {
    logger.info(`User ${user.emailAddress} reset their Password`);
  },
  resetPassword(user, password) {
    return new Promise((res, rej) => {
      user.setPassword(password, (err) => {
        if (err) {
          return rej(err);
        }
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        return user.save()
                    .then(() => res());
      });
    });
  },
  getUserFromValidToken(token) {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  },
  isValidToken(token) {
    return User.getUserFromValidToken(token)
            .then((user) => !!user);
  },
  generateToken(emailAddress) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return User.findOne({ emailAddress }).populate('volunteer')
            .then((user) => {
              if (!user) {
                throw new Error(`We couldn't find an account for "${emailAddress}". Maybe you signed up using a different email address?`);
              }
              return createToken()
                    .then((token) => {
                      user.resetPasswordToken = token;
                      user.resetPasswordExpires = tomorrow;
                      return user.save()
                            .then(() => ({ token, user }));
                    });
            });
  },
  generateKeys(user) {
    if (user.authentication.apiKeys.length < API_KEYS_MAX) {
      user.authentication.apiKeys.push({
        token: uuidV1(),
        scope: ['all'],
      });
      // allow this to happen completely asyncronously
      user.save();
    }
  },
  createUser(emailAddress, password) {
    return User
            .findOne({ emailAddress })
            .lean()
            .then((user) => {
              if (user) {
                throw new Error('There is already a User with that email');
              }
              const newUser = new User({
                emailAddress,
              });
              return registerUser(newUser, password);
            });
  },
  setPassword(user) {
    return new Promise((resolve) => {
      return resolve(user);
    });
  },
  getUser(_id) {
    return new Promise((resolve, reject) => {
      User.findOne({ _id })
                .then((user) => {
                  if (!user) {
                    reject(`User ${_id} not found`);
                  }
                  resolve(user);
                });
    });
  },
  getUserByEmail(emailAddress) {
    return new Promise((resolve, reject) => {
      User.findOne({ emailAddress })
                .then((user) => {
                  if (!user) {
                    reject(`User ${emailAddress} not found`);
                  }
                  resolve(user);
                });
    });
  },
});
