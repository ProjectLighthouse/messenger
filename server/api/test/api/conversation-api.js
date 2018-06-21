/**
 * Created by joaogabriellima on 08/05/18.
 */
const request = require('../helpers/request');

module.exports = {
  getStatus(userId) {
    return request.post('/api/', {
      userId,
    });
  },
};
