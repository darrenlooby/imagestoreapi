const db = require('../lib/db');
const constants = require('../lib/constants');
const _ = require('underscore');

const getImages = async (query) => {
  const con = await db.con();
  let images;
  if (query) {
    Object.assign(query, { delete: { $ne: true } });
    images = _.first(await con.collection(constants.IMAGE_COLLECTION)
      .find(query)
      .project({ _id: 0 })
      .toArray());
  } else {
    images = await con.collection(constants.IMAGE_COLLECTION)
      .find({ deleted: { $ne: true } })
      .project({ _id: 0 })
      .toArray();
  }
  return images;
};

const deleteImage = async (id) => {
  // delete the record for a given image
  const con = await db.con();
  const images = await con.collection(constants.IMAGE_COLLECTION)
    .findOneAndUpdate({ id }, { $set: { deleted: true } });
  return images;
};

const initCounter = async () => {
  // create a new counter to track image IDs
  const con = await db.con();
  const counter = await con.collection(constants.COUNTERS).find({ counter: 'images' }).count();
  // if counter = 0, then it either hasn't been set
  if (counter !== 1) {
    await con.collection(constants.COUNTERS).insert({ counter: 'images', count: 0 });
  }
  // eslint-disable-next-line
  console.log('initCounter done');
};

const save = async (record) => {
  const con = await db.con();
  const counter = await con.collection(constants.COUNTERS).findOneAndUpdate({ counter: 'images' }, { $inc: { count: 1 } });
  Object.assign(record, { id: counter.value.count });
  const image = await con.collection(constants.IMAGE_COLLECTION).insertOne(record);
  return _.first(image.ops);
};

module.exports = { getImages, deleteImage, save, initCounter };
