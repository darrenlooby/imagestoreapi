const _ = require('underscore');

const database = require('../service/database');
const s3 = require('../service/s3');

const { ClientError } = require('../lib/err');

const listImages = async (req, res) => {
  // capures single or multople images
  const image = req.swagger.params.id;
  if (image) {
    const imageRecord = await database.getImages({ id: image.value });
    delete imageRecord.s3path;
    return res.json(imageRecord);
  }
  const images = await database.getImages();
  // removing s3path from output
  images.map((item) => {
    const current = item;
    delete current.s3path;
    return current;
  });
  return res.json(images);
};

const getImage = listImages;

const deleteImage = async (req, res, next) => {
  const image = req.swagger.params.id;
  const deleted = await database.deleteImage(image.value);
  if (deleted.value) {
    await s3.deleteFiles(_.first(deleted.value.s3path.split('/')));
    return res.json({});
  }
  return next(new ClientError('not found', { statusCode: 404 }));
};

module.exports = { listImages, getImage, deleteImage };
