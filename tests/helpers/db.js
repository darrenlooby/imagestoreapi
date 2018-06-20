const dbName = 'image';

const { MongoClient } = require('mongodb');

let dbClient;
let db;

async function setup(url) {
  if (!db) {
    dbClient = await MongoClient.connect(url);
    db = dbClient.db(dbName);
  }
}

async function getDb(url) {
  if (!db) {
    await setup(url);
  }
  return db;
}

function kill() {
  if (dbClient && typeof dbClient.close !== 'undefined') {
    dbClient.close();
  }
}

module.exports = {
  setup,
  con: url => getDb(url),
  kill
};
