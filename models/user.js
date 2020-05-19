const mongoose = require("mongoose");
const ObjectID = mongoose.ObjectID;

const Product = require("../models/product");

const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  resetToken: { type: String },
  resetTokenExp: { type: Date },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {
  productID = product._id;
  let oldCart = this.cart;
  let updateCart;
  if (oldCart.items.length === 0) {
    updateCart = {
      items: [{ productId: productID, quantity: 1 }]
    };
  } else {
    const productIndex = oldCart.items.findIndex(cartProduct => {
      return cartProduct.productId.toString() === productID.toString();
    });
    if (productIndex !== -1) {
      oldCart.items[productIndex].quantity++;
      updateCart = { ...oldCart };
    } else {
      oldCart.items.push({
        productId: productID,
        quantity: 1
      });
      updateCart = { ...oldCart };
    }
  }
  this.cart = updateCart;
  return this.save();
};

userSchema.methods.getCartItems = function() {
  let productIds = this.cart.items.map(i => {
    return i.productId;
  });

  Product.find()
    .where("id")
    .in(productIds)

    // db
    //   // .collection("products")
    //   // .find({ _id: { $in: productIds } })
    //   // .toArray()
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
};

module.exports = mongoose.model("User", userSchema);
