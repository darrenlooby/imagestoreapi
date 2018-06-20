const AWS = require('aws-sdk');
const fs = require('fs-extra');
const _ = require('underscore');

const { ServiceError } = require('../lib/err');

const config = {
  hostname: '0.0.0.0',
  s3ForcePathStyle: true,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: new AWS.Endpoint(process.env.S3LOCATION)
};

const bucketName = process.env.S3_BUCKET_NAME;

const s3 = new AWS.S3(config);

const pingBucket = () => new Promise((resolve, reject) => {
  s3.listObjects({
    Bucket: bucketName,
    MaxKeys: 1
  }, (err, data) => {
    if (err) {
      return reject(new ServiceError(`Error pinging bucket: ${err}`));
    }
    return resolve(data.Contents.length > -1);
  });
});

const getImages = key => new Promise((resolve, reject) => {
  s3.listObjects({
    Bucket: bucketName,
    Prefix: key
  }, (err, data) => {
    if (err) {
      return reject(new ServiceError(`error finding images: ${err}`));
    }
    return resolve(data);
  });
});

const getImage = path => new Promise((resolve, reject) => {
  s3.getObject({
    Bucket: bucketName,
    Key: path
  }, (err, data) => {
    if (err) {
      return reject(new ServiceError(`error finding images: ${err}`));
    }
    return resolve(data);
  });
});

const listAllFiles = prefix => new Promise((resolve, reject) => {
  const query = { Bucket: bucketName };
  if (prefix) {
    query.Prefix = prefix;
  }
  s3.listObjects(query, (err, data) => {
    if (err) {
      return reject(new ServiceError(`Error pinging bucket: ${err}`));
    }
    return resolve(data.Contents);
  });
});

const saveFile = (filePath, fileKey) => new Promise((resolve, reject) => {
  let fileBody;
  if (_.isString(filePath)) {
    fileBody = fs.readFileSync(filePath);
  } else {
    fileBody = filePath;
  }
  s3.upload({
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBody
  }, (err, data) => {
    if (err) {
      return reject(new ServiceError(`Error saving file: ${fileKey} > ${err}`));
    }
    return resolve(data);
  });
});

const deleteFile = filePath => new Promise((resolve, reject) => {
  s3.deleteObject({
    Bucket: bucketName,
    Key: filePath
  }, (err, data) => {
    if (err) {
      return reject(new ServiceError(`Error deleting file: ${filePath} > ${err}`));
    }
    return resolve(data);
  });
});

const deleteFileArray = filePaths => new Promise((resolve, reject) => {
  s3.deleteObjects({
    Bucket: bucketName,
    Delete: { Objects: filePaths }
  }, (err, data) => {
    if (err) {
      // eslint-disable-next-line no-console
      return reject(new ServiceError(`Error deleting group of files: ${JSON.stringify(filePaths)} > ${err}`));
    }
    return resolve(data);
  });
});

const deleteFiles = async (root) => {
  const allFiles = await listAllFiles(root);
  const filePaths = allFiles.map(item => ({ Key: item.Key }));
  if (filePaths.length > 0) {
    return deleteFileArray(filePaths);
  }
  return false;
};

const deleteAllFiles = async () => {
  const allFiles = await listAllFiles();
  const filePaths = allFiles.map(item => ({ Key: item.Key }));
  if (filePaths.length > 0) {
    return deleteFileArray(filePaths);
  }
  return false;
};

module.exports = {
  pingBucket,
  saveFile,
  deleteFile,
  listAllFiles,
  deleteAllFiles,
  deleteFiles,
  getImages,
  getImage
};
