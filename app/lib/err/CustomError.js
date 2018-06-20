class CustomError extends Error {
  constructor(message, params) {
    super(message, params);
    Object.assign(this, params);
    this.name = this.constructor.name;
    if (params && params.consoleMessage) {
      // eslint-disable-next-line
      console.error(`ERROR(${params.statusCode})`, params.consoleMessage);
    }
  }
}

module.exports = CustomError;
