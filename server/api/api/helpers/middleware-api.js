const ObjectId = require('mongoose').Types.ObjectId;

const { User } = require('../../models');

function getUser(_id) {
  if (!_id) {
    return Promise.reject(_id);
  }

  return User.findOne({
    _id,
  });
}

module.exports = {
  requireLoggedInUser(req, res, next) {
    if (req.session.userId) {
      return next();
    }
    res.status(401);
    return res.send({ message: 'user must be authenticated' });
  },
  getUser(req, res, next) {
    return getUser(req.session.userId).then((user) => {
      if (!user) {
        res.status(401);
        return res.send({ message: 'session user does not exist' });
      }
      req.user = user;
      return next();
    });
  },
  getFullUser(req, res, next) {
    return getUser(req.session.userId).then((user) => {
      if (!user) {
        res.status(401);
        return res.send({ message: 'session user does not exist' });
      }
      req.user = user;
      return next();
    });
  },
};
