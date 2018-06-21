const Analytics = require('analytics-node');

const { logger } = require('./log');

function createSegmentStub() {
  return {
    track: () => {},
    identify: () => {},
    group: () => {},
    page: () => {},
    alias: () => {},
  };
}

function setupSegment() {
  if (!process.env.SEGMENT_KEY) {
    logger.info('SEGMENT_KEY not found - stubbing out segment methods');
    return createSegmentStub();
  }

  logger.info(`Segment started with key "${process.env.SEGMENT_KEY}"`);
  return new Analytics(process.env.SEGMENT_KEY);
}

module.exports.analytics = setupSegment();
