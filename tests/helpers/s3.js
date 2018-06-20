const AWS = require('aws-sdk');

const config = {
  hostname: '0.0.0.0',
  s3ForcePathStyle: true,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: new AWS.Endpoint(process.env.S3LOCATION)
};

const bucketName = process.env.S3_BUCKET_NAME;

const s3 = new AWS.S3(config);

const listAllFiles = prefix => new Promise((resolve, reject) => {
  const query = { Bucket: bucketName };
  if (prefix) {
    query.Prefix = prefix;
  }
  s3.listObjects(query, (err, data) => {
    if (err) {
      return reject(new Error(`Error listAllFiles: ${err}`));
    }
    return resolve(data.Contents);
  });
});

const deleteFileArray = filePaths => new Promise((resolve, reject) => {
  s3.deleteObjects({
    Bucket: bucketName,
    Delete: { Objects: filePaths }
  }, (err, data) => {
    if (err) {
      // eslint-disable-next-line no-console
      return reject(new Error(`Error deleting group of files: ${JSON.stringify(filePaths)} > ${err}`));
    }
    return resolve(data);
  });
});


const deleteAllFiles = async () => {
  const allFiles = await listAllFiles();
  const filePaths = allFiles.map(item => ({ Key: item.Key }));
  if (filePaths.length > 0) {
    return deleteFileArray(filePaths);
  }
  return false;
};

module.exports = { deleteAllFiles };
