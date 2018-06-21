const bugsnag = require('bugsnag');
const winston = require('winston');
const { BugsnagTransport } = require('winston-bugsnag');

const { Papertrail } = require('winston-papertrail');

const environment = process.env.SERVER_ENVIRONMENT || 'local';
const SHOULD_USE_REMOTE_LOGS = environment !== 'local';
const REQUIRE_REMOTE_LOGS = environment === 'prod';

const logger = new (winston.Logger)({
  level: 'info',
  transports: [
    new winston.transports.Console(),
  ],
});

function registerBugSnag() {
  if (!SHOULD_USE_REMOTE_LOGS) {
    return;
  }

  if (!process.env.BUGSNAG_API_KEY) {
    if (REQUIRE_REMOTE_LOGS) {
      throw new Error('The environment variable "BUGSNAG_API_KEY" must be defined');
    } else {
      logger.info('The environment variable "BUGSNAG_API_KEY" is not definied defined');
    }

    return;
  }

  bugsnag.register(process.env.BUGSNAG_API_KEY, {
    releaseStage: environment,
  });
  logger.add(BugsnagTransport, { level: 'error' });
}

function registerPaperTrail() {
  if (!SHOULD_USE_REMOTE_LOGS) {
    return;
  }
  if (!process.env.PAPERTRAIL_HOST || !process.env.PAPERTRAIL_PORT) {
    if (REQUIRE_REMOTE_LOGS) {
      throw new Error('The environment variables "PAPERTRAIL_HOST" and PAPERTRAIL_PORT must be defined');
    }
  }

  logger.add(winston.transports.Papertrail, {
    level: 'info',
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT,
  });
}

function registerRemoteLogServices() {
  registerBugSnag();
  registerPaperTrail();
}

registerRemoteLogServices();

function loggingRequestMiddleware(app) {
  if (!SHOULD_USE_REMOTE_LOGS) {
    return;
  }

  app.use(bugsnag.requestHandler);
}

function loggingErrorMiddleware(app) {
  if (!SHOULD_USE_REMOTE_LOGS) {
    return;
  }

  app.use(bugsnag.errorHandler);
}

module.exports.logger = logger;
module.exports.loggingRequestMiddleware = loggingRequestMiddleware;
module.exports.loggingErrorMiddleware = loggingErrorMiddleware;
