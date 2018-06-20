const _ = require('underscore');
const database = require('../service/database');
const s3 = require('../service/s3');
const mime = require('mime-types');

const path = require('path');
const Jimp = require('jimp');

const { ClientError } = require('../lib/err');

// eslint-disable-next-line consistent-return
const resizeImage = async (req, res, next) => {
  const image = req.swagger.params.id;
  const { width, height } = req.swagger.params;
  // always gives an array, break out
  const record = _.first(await database.getImages(image.value));

  if (!record) {
    return next(new ClientError('no such file in database 404', { status: 404 }));
  }

  if (record.width !== width.value && record.height !== height.value) {
    // need to create and cache new dims

    const s3Root = _.first(record.s3path.split('/'));

    const parsedFile = path.parse(record.name);

    const newSizePath = `${s3Root}/${parsedFile.name}-${width.value}x${height.value}${parsedFile.ext}`;

    const findInS3 = await s3.getImages(s3Root);
    if (findInS3.Contents) {
      const allKeys = await findInS3.Contents.map(file => file.Key);
      const newRecord = record;

      if (allKeys.indexOf(newSizePath) < 0) {
        // no cached version in s3, so make a new one

        const file = await s3.getImage(record.s3path);
        const originalFile = await Jimp.read(file.Body);

        const resizedFile = originalFile.resize(width.value, height.value);

        resizedFile.getBuffer(mime.lookup(parsedFile.ext), async (err, buf) => {
          if (err) {
            return next(err);
          }

          const newFile = await s3.saveFile(buf, newSizePath);
          newRecord.url = newFile.Location;
          newRecord.width = width.value;
          newRecord.height = height.value;
          delete newRecord.s3path;
          return res.json(newRecord);
        });
      } else {
        // there was a cached version in s3
        newRecord.fromCache = true;
        return res.json(newRecord);
      }
    }
  } else {
    // already the correct size
    delete record.s3path;
    return res.json(record);
  }
};

module.exports = { resizeImage };
