const Product = require("../models/product");
const Order = require("../models/order");
//  / => GET
exports.getHomePage = (req, res, next) => {
  Product.findAll()
    .then(products => {
      return res.render("shop/products.ejs", {
        prods: products,
        pageTitle: "shop",
        path: "/products"
      });
    })
    .catch(err => console.log(err))
    .catch();
};

//  /products => GET
exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      return res.render("shop/products.ejs", {
        prods: products,
        pageTitle: "shop",
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};

// /products/123 => GET (for details btn)
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productID;
  Product.findOne({ where: { id: prodId } })
    .then(product => {
      // return console.log(product);
      return res.render("shop/product-detail.ejs", {
        product: product,
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch();
};

//  /cart => GET
exports.getCart = (req, res, next) => {
  let cartPrice = 0;
  req.user
    .getCart()
    .then(cart => {
      cart
        .getProducts()
        .then(products => {
          products.forEach(product => {
            cartPrice += product.price * product.cartItem.quantity;
          });
          res.render("shop/cart.ejs", {
            pageTitle: "Your Cart",
            path: "/cart",
            prods: products,
            totalPrice: cartPrice
          });
        })
        .catch();
    })
    .catch();
};

//  /cart => POST
exports.postCart = (req, res, next) => {
  let id = req.body.productID;
  let fetchedCart;
  let prod2Badded;
  let oldPrice;
  let newPrice;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      oldPrice = fetchedCart.totalPrice;
      return cart.getProducts({ where: { id: id } });
    })
    .then(cartProducts => {
      let newQuantity = 1;
      if (cartProducts.length > 0) {
        prod2Badded = cartProducts[0];
      }
      if (prod2Badded) {
        const oldQuant = prod2Badded.cartItem.quantity;
        newQuantity = oldQuant + 1;
        newPrice = prod2Badded.price + oldPrice;
        fetchedCart.totalPrice = newPrice;
        fetchedCart.save();
        return fetchedCart.addProduct(prod2Badded, {
          through: { quantity: newQuantity }
        });
      } else {
        Product.findByPk(id)
          .then(product => {
            newPrice = product.price + oldPrice;
            fetchedCart.totalPrice = newPrice;
            fetchedCart.save();
            return fetchedCart.addProduct(product, {
              through: { quantity: newQuantity }
            });
          })
          .then(() => {
            return res.redirect("/cart");
          })
          .catch();
      }
    })
    .then(() => {
      return res.redirect("/cart");
    })
    .catch();
};

//  /cart/delete/2 => POST
exports.postDelCartProd = (req, res, next) => {
  let id = req.params.productID;
  let oldPrice;
  let newPrice;
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      oldPrice = cart.totalPrice;

      cart
        .getProducts({ where: { id: id } })
        .then(product => {
          newPrice = oldPrice - product[0].cartItem.quantity * product[0].price;
          fetchedCart.totalPrice = newPrice;
          fetchedCart.save();
          return product[0].cartItem.destroy();
        })
        .then(result => {
          return res.redirect("/cart");
        })
        .catch();
    })
    .catch();
};

exports.postOrder = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts().then(products => {
        return req.user
          .createOrder()
          .then(order => {
            order.addProducts(
              products.map(product => {
                product.orderItem = { quantity: product.cartItem.quantity };
                return product;
              })
            );
          })
          .then(() => {
            return res.redirect("/orders");
          });
      });
    })
    .catch();
};
