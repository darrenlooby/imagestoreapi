const constants = require('../lib/constants');
const multer = require('multer');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const uuid = require('uuid').v4;

const { ClientError } = require('../lib/err');

const swaggerDoc = yaml.safeLoad(fs.readFileSync('./swagger.yaml'));
const mimetypes = swaggerDoc.definitions.mimetypes.items.enum;

module.exports = multer({
  limits: { fileSize: constants.FILE_LIMIT_MB * 1024 * 1024 },
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, constants.TEMP_DIRECTORY);
    },
    filename(req, file, cb) {
      return cb(null, uuid());
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || mimetypes.indexOf(file.mimetype) < 0) {
      return cb(new ClientError('mimetype not allowed', 400));
    }
    return cb(null, true);
  }
}).any();
