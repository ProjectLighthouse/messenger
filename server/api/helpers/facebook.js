const request = require('request-promise');

module.exports = {
  getLongLivedAccessToken(accessToken) {
    return request(`https://graph.facebook.com/v2.10/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${accessToken}`, {
      json: true,
    }).catch(() => {});
  },

  findFriendsOnFacebook(facebookId, accessToken) {
    return request(`https://graph.facebook.com/v2.10/me/friends?access_token=${accessToken}`, {
      json: true,
    })
    .then((response) => {
      return response.data;
    });
  },

  getProfile(accessToken) {
    return request(`https://graph.facebook.com/v2.10/me?access_token=${accessToken}&fields=id,name,email,picture.type(large)`, {
      json: true,
    });
  },
  verifyLogin(accessToken) {
    return Promise
      .all([
        this.getProfile(accessToken),
        this.getLongLivedAccessToken(accessToken),
      ])
      .then(([user, longLived = {}]) => {
        const profileImage = user.picture.data.url;

        return {
          accessToken: longLived.access_token || accessToken,
          facebookId: user.id,
          name: user.name,
          email: user.email,
          profileImage,
        };
      });
  },
};
