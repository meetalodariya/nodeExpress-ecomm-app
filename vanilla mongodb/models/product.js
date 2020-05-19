const mongodb = require("mongodb");
const getDb = require("../utils/database").getDB;

class Product {
  constructor(title, price, imageURL, description, id, userId) {
    this.title = title;
    this.price = price;
    this.imageURL = imageURL;
    this.description = description;
    this._id = id;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    const col = db.collection("products");
    let cursor;
    if (this._id) {
      cursor = col.updateOne(
        { _id: new mongodb.ObjectID(this._id) },
        {
          $set: {
            title: this.title,
            price: this.price,
            imageURL: this.imageURL,
            description: this.description
          }
        }
      );
    } else {
      cursor = col.insertOne(this);
    }
    return cursor;
  }

  static fetchAll() {
    const db = getDb();
    const col = db.collection("products");
    return col.find({}).toArray();
    // .then(data => {
    //   return data;
    // });
  }

  static findById(id) {
    const db = getDb();
    const col = db.collection("products");
    return col
      .find({ _id: new mongodb.ObjectID(id) })
      .next()
      .then(product => {
        return product;
      })
      .catch();
  }

  static deleteById(id) {
    const db = getDb();
    const col = db.collection("products");
    return col
      .deleteOne({ _id: new mongodb.ObjectID(id) })
      .then(result => console.log("deleted :", result))
      .catch(err => console.log(err));
  }
}

module.exports = Product;
