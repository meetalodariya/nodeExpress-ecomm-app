const Product = require("../models/product");
//  / => GET
exports.getHomePage = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      return res.render("shop/products.ejs", {
        prods: products,
        pageTitle: "shop",
        path: "/"
      });
    })
    .catch(err => console.log(err));
};

//  /products => GET
exports.getProducts = (req, res, next) => {
  Product.fetchAll()
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
  Product.findById(prodId)
    .then(product => {
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
  req.user.getCartItems().then(products => {
    console.log(products);
    products.forEach(product => {
      cartPrice += product.price * product.quantity;
    });
    return res.render("shop/cart.ejs", {
      pageTitle: "Your Cart",
      path: "/cart",
      prods: products,
      totalPrice: cartPrice
    });
  });
};

//  /cart => POST
exports.postCart = (req, res, next) => {
  let id = req.body.productID;

  Product.findById(id)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      return res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

//  /cart/delete/2 => POST
exports.postDelCartProd = (req, res, next) => {
  let id = req.params.productID;
  req.user
    .deleteCartItem(id)
    .then(result => {
      return res.redirect("/cart");
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
