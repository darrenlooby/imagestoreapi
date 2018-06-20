const { ClientError } = require('../lib/err');

const basicAuth = (req, def, scopes, callback) => {
  // @TODO connect to database of users
  // @TODO match passwords against salted one way hash
  const user = 'user';
  const pass = 'pass';

  // make sure headers are sent
  if (req.headers.authorization) {
    const authToken = req.headers.authorization.split(' ');
    // check auth type matches
    if (def.type !== authToken[0].toLowerCase()) {
      return callback(new ClientError('wrong auth type', { statusCode: 403 }));
    }
    // pull out username and password given in request header
    const [userSent, passSent] = Buffer.from(authToken[1], 'base64').toString().split(':');

    // validate username and password
    if (userSent !== user || passSent !== pass) {
      return callback(new ClientError('invalid credentials', { statusCode: 403 }));
    }
    return callback();
  }
  return callback(new ClientError('no auth header sent', { statusCode: 403 }));
};

module.exports = { basicAuth };
