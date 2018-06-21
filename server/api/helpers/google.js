const GoogleAuth = require('google-auth-library');
const auth = new GoogleAuth();
const client = new auth.OAuth2(process.env.GOOGLE_CLIENT_ID, '', '');

module.exports = {
  verifyLogin(token) {
    return new Promise((resolve, reject) => {
      client.verifyIdToken(
        token,
        process.env.GOOGLE_CLIENT_ID,
        (error, login) => {
          if (error) {
            reject(error);
          } else {
            resolve(login.getPayload());
          }
        }
      );
    });
  },
};
