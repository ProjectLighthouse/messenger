const Redis = require('../helpers/redis');

module.exports = class RedisGetManager {
  constructor(expire) {
    this.instances = {};
    this.expire = expire; // convert to seconds
  }

  getKeysMatching(key) {
    return new Promise((res, rej) => {
      Redis.keys(key, (err, keys) => {
        if (err) {
          return rej(err);
        }
        return res(keys);
      });
    });
  }

  deleteByKeys(keys) {
    return new Promise((res, rej) => {
      if (!keys || !keys.length) {
        return res();
      }

      return Redis.del(keys, (err, output) => {
        if (err) {
          return rej(err);
        }

        return res(output);
      });
    });
  }

  getAsync(key) {
    const instance = this.instances[key];

    if (instance && instance.type === 'get' && new Date() - instance.date < 2 * 1000) {
      return instance.promise;
    }

    delete this.instances[key];

    const promise = Redis.getAsync(key);

    this.instances[key] = {
      promise,
      date: new Date(),
      type: 'get',
    };

    return promise;
  }

  setAsync(key, value) {
    const promise = Redis.setAsync(key, JSON.stringify(value), 'EX', this.expire);

    this.instances[key] = {
      promise,
      date: new Date(),
      type: 'set',
    };

    return promise;
  }
};
