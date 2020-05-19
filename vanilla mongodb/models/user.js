const getDb = require("../utils/database").getDB;
const mongodb = require("mongodb");
const ObjectID = mongodb.ObjectID;

class User {
  constructor(id, name, email, cart) {
    this._id = id;
    this.name = name;
    this.email = email;
    this.cart = cart;
  }

  save() {
    const db = getDb();
    const col = db.collection("users");
    return col.insertOne(this);
  }

  static findById(userId) {
    const db = getDb();
    const col = db.collection("users");
    return col.findOne({ _id: new ObjectID(userId) });
  }

  getCartItems() {
    const db = getDb();
    let productIds = this.cart.items.map(i => {
      return i.productId;
    });
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        return products.map(prod => {
          return {
            ...prod,
            quantity: this.cart.items.find(cartItem => {
              return cartItem.productId.toString() === prod._id.toString();
            }).quantity
          };
        });
      })
      .catch();
  }

  addToCart(product) {
    const db = getDb();
    let productID = ObjectID(product._id).toString();
    let oldCart = this.cart;
    let updateCart;
    if (oldCart.items.length === 0) {
      updateCart = {
        items: [{ productId: new ObjectID(productID), quantity: 1 }]
      };
    } else {
      const productIndex = oldCart.items.findIndex(cartProduct => {
        return ObjectID(cartProduct.productId).toString() === productID;
      });
      if (productIndex !== -1) {
        oldCart.items[productIndex].quantity++;
        updateCart = { ...oldCart };
      } else {
        oldCart.items.push({
          productId: new ObjectID(productID),
          quantity: 1
        });
        updateCart = { ...oldCart };
      }
    }
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectID(this._id) },
        { $set: { cart: updateCart } }
      );
  }

  deleteCartItem(id) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== id;
    });
    const updateCart = { items: [...updatedCartItems] };
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectID(this._id) },
        { $set: { cart: updateCart } }
      );
  }
}

module.exports = User;
