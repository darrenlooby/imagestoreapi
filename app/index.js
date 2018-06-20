const app = require('express')();
const swaggerTools = require('swagger-tools');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const autoreap = require('multer-autoreap');
const morgan = require('morgan');

const fileCache = require('./service/fileCache');

const serverPort = process.env.INGRESS_PORT;

const db = require('./lib/db');
const database = require('./service/database');

const swaggerDoc = yaml.safeLoad(fs.readFileSync(process.env.SWAGGER));

const { basicAuth } = require('./lib/auth_middleware');

app.use(morgan('tiny'));

app.setup = async () => {
  await db.setup(process.env.MONGO_CONNECTION);

  await database.initCounter();

  swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
    // Overwrite swagger tools implementation of multer
    app.use(fileCache);
    // remove old files at end of request or upon error
    app.use(autoreap);
    app.use(middleware.swaggerMetadata());
    app.use(middleware.swaggerSecurity({ basicAuth }));
    app.use(middleware.swaggerValidator());
    app.use(middleware.swaggerRouter({ controllers: process.env.CONTROLLERS }));
    app.use(middleware.swaggerUi());
    // eslint-disable-next-line
    app.use((err, req, res, next) => {
      // really basic error passing
      let status = 500;
      if (err.statusCode) {
        status = err.statusCode;
      }
      return res.status(status).json({ error: err.message });
    });
  });
};

app.setup();

app.listen(serverPort, () => {
  // eslint-disable-next-line no-console
  console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
});

process.on('unhandledRejection', (reason, p) => {
  // eslint-disable-next-line
  console.log('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});
