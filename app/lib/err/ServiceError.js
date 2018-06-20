const CustomError = require('./CustomError');

class ServiceError extends CustomError {
  constructor(message, params) {
    super(message, params);
    Object.assign(this, params);
    this.statusCode = this.statusCode || 500;
    Error.captureStackTrace(this, ServiceError);
  }
}


module.exports = ServiceError;
