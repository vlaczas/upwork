let DB;
require('../config/mongo').then(db => DB = db.collection('queries'));
const { ObjectId } = require('mongodb');

class Query {
  query = null;
  id = null;

  constructor(query, name) {
    if (!query._id) {
      this.query = {
        createdAt: new Date(), query, active: true, name,
      };
    } else {
      this.id = query._id;
      delete query._id;
      this.query = query;
    }
  }

  static async getDocs(filter = {}, projection = {}) {
    return DB.find(filter, { projection }).toArray();
  }

  static async delete(filter = {}) {
    return DB.deleteOne(filter);
  }

  async save() {
    if (this.id) {
      this.query.updatedAt = new Date();
      await DB.updateOne({ _id: ObjectId(this.id) }, { $set: this.query });
    } else if (this.query) {
      const { insertedId } = await DB.insertOne(this.query);
      this.query._id = insertedId;
    }
  }
}

module.exports = Query;
