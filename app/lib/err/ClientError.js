const CustomError = require('./CustomError');

class ClientError extends CustomError {
  constructor(message, params) {
    super(message, params);
    Object.assign(this, params);
    this.statusCode = this.statusCode || 400;
    Error.captureStackTrace(this, ClientError);
  }
}

module.exports = ClientError;
