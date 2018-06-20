const S3rver = require('s3rver');
const AWS = require('aws-sdk');

const config = {
  hostname: '0.0.0.0',
  s3ForcePathStyle: true,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: new AWS.Endpoint('http://localhost:4569')
};

const s3 = new AWS.S3(config);

new S3rver({
  port: 4569,
  hostname: '0.0.0.0',
  silent: true
}).run((err, host, port) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Server started on: ${host}:${port} =>`);
    s3.createBucket({ Bucket: 'imagestore' }, (s3err) => {
      if (s3err) {
        // eslint-disable-next-line no-console
        console.log(`Bucket not created: imagestore because ${s3err}`);
      } else {
        // eslint-disable-next-line no-console
        console.log('Created bucket: imagestore');
      }
    });
  }
});
