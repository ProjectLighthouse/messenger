const url = require('url');

const environment = process.env.SERVER_ENVIRONMENT || 'local';
const SHOULD_USE_HTTPS = environment !== 'local';
const apiUrl = process.env.API_REQUEST_URL || '/api/';
const { logger } = require('../../helpers/log');

logger.log(`Using ${apiUrl} for serverside requests`);

function getProtocol() {
  if (SHOULD_USE_HTTPS) {
    return 'https';
  }

  return 'http';
}

function createFullUrlFromPath(host, path) {
  const protocol = getProtocol();
  return url.resolve(`${protocol}://${host}`, path);
}

function getAPIUrlFromPath(path) {
  return url.resolve(apiUrl, path);
}

module.exports.createFullUrlFromPath = createFullUrlFromPath;
module.exports.getAPIUrlFromPath = getAPIUrlFromPath;
