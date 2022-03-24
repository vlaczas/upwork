const MongoClient = require('mongodb').MongoClient;

const dbName = 'upwork';
const database = new MongoClient(process.env.DATABASE);
let isConnected = false;

module.exports = (
  async () => {
    if (isConnected) return database;
    await database.connect();
    isConnected = true;
    console.log(`MongoDB Connected: ${ database.s.options.srvHost }`);
    return database.db(dbName);
  }
)();
