const _ = require('underscore');
const database = require('../service/database');
const s3 = require('../service/s3');

const path = require('path');
const Jimp = require('jimp');

const uploadImage = async (req, res) => {
  // always an array of files in current implementation, so break out
  const file = _.first(req.files);
  const filePath = file.path;

  const parsedFile = path.parse(file.originalname);
  const imageData = await Jimp.read(filePath);
  const { width, height } = imageData.bitmap;

  // construct a path key that include dimensions
  const filename = `${file.filename}/${parsedFile.name}-${width}x${height}${parsedFile.ext}`;

  const saved = await s3.saveFile(filePath, filename);

  const record = {
    name: file.originalname,
    url: saved.Location,
    s3path: saved.Key,
    width,
    height
  };

  const data = await database.save(record);

  // eslint-disable-next-line no-underscore-dangle
  delete data._id;
  delete data.s3path;

  res.json(data);
};

module.exports = { uploadImage };
