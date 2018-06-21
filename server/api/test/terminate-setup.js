
const { removeTestRecords } = require('./helpers/setup');

describe('Setup Mocha Tests', function () {
  this.timeout(5000);
  it('drops test records', () => {
    return removeTestRecords();
  });
});
