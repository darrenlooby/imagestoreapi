const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs-extra');
const _ = require('underscore');
const Jimp = require('jimp');

chai.use(chaiHttp);

const db = require('../helpers/db');
const s3 = require('../helpers/s3');

const imageFilename = 'countryside.jpg';
const pdfFilename = 'useless.pdf';
const path = './spec/';

const imageData = fs.readFileSync(path + imageFilename);
const pdfData = fs.readFileSync(path + imageFilename);

const { expect, request } = chai;

const app = request(process.env.APP_ROOT);

describe('POST /upload', () => {
  let firstUpload;
  let firstUploadWidth;
  let firstUploadHeight;
  let secondUpload;
  let secondUploadWidth;
  let secondUploadHeight;
  let failedAuthRequest;
  let badFileUpload;
  let badAuthRequest;

  let getAllImages;
  let getSingleImage;
  let deleteSingleImage;
  let getAllImagesAfterDelete;
  let resizeSingleImage;

  const newWidth = 200;
  const newHeight = 200;

  let con;

  before(async () => {
    con = await db.con(process.env.MONGO_CONNECTION);
    await con.collection('store').remove({});
    await con.collection('counter').remove({});
    await con.collection('counter').insert({ counter: 'images', count: 0 });
    await s3.deleteAllFiles();

    const imageDataJimp = await Jimp.read(imageData);
    firstUploadWidth = imageDataJimp.bitmap.width;
    firstUploadHeight = imageDataJimp.bitmap.height;
    secondUploadWidth = imageDataJimp.bitmap.width;
    secondUploadHeight = imageDataJimp.bitmap.height;

    firstUpload = await app.post('/upload')
      .field('filename', imageFilename)
      .attach('File', imageData, imageFilename)
      .auth('user', 'pass');

    secondUpload = await app.post('/upload')
      .field('filename', imageFilename)
      .attach('File', imageData, imageFilename)
      .auth('user', 'pass');

    failedAuthRequest = await app.post('/upload')
      .field('filename', imageFilename)
      .attach('File', imageData, imageFilename);

    badAuthRequest = await app.post('/upload')
      .field('filename', imageFilename)
      .attach('File', imageData, imageFilename)
      .auth('user', 'wrong');

    badFileUpload = await app.post('/upload')
      .field('filename', pdfFilename)
      .attach('File', pdfData, pdfFilename)
      .auth('user', 'pass');
  });

  it('firstUpload return 200 when valid', (done) => {
    expect(firstUpload.statusCode).to.be.equal(200);
    done();
  });

  it('firstUpload should be correct witdh', (done) => {
    expect(firstUpload.body.width).to.be.equal(firstUploadWidth);
    done();
  });

  it('firstUpload should be correct height', (done) => {
    expect(firstUpload.body.height).to.be.equal(firstUploadHeight);
    done();
  });

  it('secondUpload return 200 when valid', (done) => {
    expect(secondUpload.statusCode).to.be.equal(200);
    done();
  });

  it('secondUpload should be correct witdh', (done) => {
    expect(secondUpload.body.width).to.be.equal(secondUploadWidth);
    done();
  });

  it('secondUpload should be correct height', (done) => {
    expect(secondUpload.body.height).to.be.equal(secondUploadHeight);
    done();
  });

  it('failedAuthRequest return 403 status code', (done) => {
    expect(failedAuthRequest.statusCode).to.be.equal(403);
    done();
  });

  it('badAuthRequest return 403 status code', (done) => {
    expect(failedAuthRequest.statusCode).to.be.equal(403);
    done();
  });

  it('badAuthRequest should send error message when wrong password sent', (done) => {
    expect(badAuthRequest.body.error).to.be.equal('invalid credentials');
    done();
  });

  it('badFileUpload return 400 when wrong file sent', (done) => {
    expect(badFileUpload.statusCode).to.be.equal(400);
    done();
  });

  it('badFileUpload should send error message when wrong file sent', (done) => {
    expect(badFileUpload.body.error).to.be.equal('mimetype not allowed');
    done();
  });

  describe('GET /images', () => {
    before(async () => {
      getAllImages = await app.get('/images');
    });

    it('getAllImages should return 200 when valid', (done) => {
      expect(getAllImages.statusCode).to.be.equal(200);
      done();
    });

    it('getAllImages should return 2 records', (done) => {
      expect(getAllImages.body.length).to.be.equal(2);
      done();
    });

    describe('GET /image', () => {
      before(async () => {
        const singleImageId = _.first(getAllImages.body).id;
        getSingleImage = await app.get(`/images/${singleImageId}`);
      });

      it('getSingleImage should return 200 when valid', (done) => {
        expect(getSingleImage.statusCode).to.be.equal(200);
        done();
      });

      describe('DELETE /image', () => {
        before(async () => {
          const singleImageDeleteId = _.last(getAllImages.body).id;

          deleteSingleImage = await app.delete(`/images/${singleImageDeleteId}`)
            .auth('user', 'pass');
          getAllImagesAfterDelete = await app.get('/images');
        });

        it('deleteSingleImage return 200 when valid', (done) => {
          expect(deleteSingleImage.statusCode).to.be.equal(200);
          done();
        });

        it('getAllImagesAfterDelete return 200 when valid', (done) => {
          expect(getAllImagesAfterDelete.statusCode).to.be.equal(200);
          done();
        });

        it('getAllImagesAfterDelete should return 1 record', (done) => {
          expect(getAllImagesAfterDelete.body.length).to.be.equal(1);
          done();
        });
      });

      describe('RESIZE /image', () => {
        before(async () => {
          const singleImageId = _.first(getAllImages.body).id;
          resizeSingleImage = await app.get(`/resize/${singleImageId}`).query({ width: newWidth, height: newHeight });
        });

        it('resizeSingleImage return 200 when valid', (done) => {
          expect(resizeSingleImage.statusCode).to.be.equal(200);
          done();
        });

        it('resizeSingleImage should return the correct width', (done) => {
          expect(resizeSingleImage.body.width).to.be.equal(newWidth);
          done();
        });

        it('resizeSingleImage should return the correct height', (done) => {
          expect(resizeSingleImage.body.height).to.be.equal(newHeight);
          done();
        });
      });
    });
  });
});
