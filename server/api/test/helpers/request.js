'use strict';

const requestPromise = require('request-promise');

const basePath = process.env.API_ROOT;

const request = {
  get(endpoint) {
    const url = `${basePath}${endpoint}`;

    if (!endpoint) {
      console.log(new Error().stack);
    }

    return requestPromise
      .get({
        headers: {
          'Content-Type': 'application/json',
        },
        url,
        json: true,
        jar: true,
      });
  },

  post(endpoint, body) {
    const url = `${basePath}${endpoint}`;

    return requestPromise.post({
      headers: {
        'Content-Type': 'application/json',
      },
      followAllRedirects: true,
      url,
      body,
      json: true,
      jar: true,
    });
  },
  put(endpoint, body) {
    const url = `${basePath}${endpoint}`;

    return requestPromise.put({
      headers: {
        'Content-Type': 'application/json',
      },
      followAllRedirects: true,
      url,
      body,
      json: true,
      jar: true,
    });
  },
};

module.exports = request;
