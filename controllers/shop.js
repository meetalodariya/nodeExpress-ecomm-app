const Product = require("../models/product");
const path = require("path");
const fs = require("fs");
const PDFdoc = require("pdfkit");

const ITEMS_PER_PAGE = 1;

//  / => GET
exports.getHomePage = (req, res, next) => {
  const pageNum = req.query.page || 1;
  // if (!pageNum) {
  //   pageNum = 1;
  // }
  let totalDocs;
  Product.find()
    .countDocuments()
    .then(numOfDoc => {
      totalDocs = numOfDoc;
      return Product.find()
        .skip((pageNum - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then(products => {
          return res.render("shop/products.ejs", {
            prods: products,
            pageTitle: "shop",
            path: "/",
            hasNextPage: ITEMS_PER_PAGE * pageNum < totalDocs,
            hasPreviousPage: pageNum > 1,
            currentPage: pageNum,
            nextPage: pageNum + 1,
            prevPage: pageNum - 1,
            lastPage: Math.ceil(totalDocs / ITEMS_PER_PAGE)
          });
        });
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
};

//  /products => GET
exports.getProducts = (req, res, next) => {
  const pageNum = req.query.page || 1;
  // if (!pageNum) {
  //   pageNum = 1;
  // }
  let totalDocs;
  Product.find()
    .countDocuments()
    .then(numOfDoc => {
      totalDocs = numOfDoc;
      return Product.find()
        .skip((pageNum - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then(products => {
          return res.render("shop/products.ejs", {
            prods: products,
            pageTitle: "shop",
            path: "/",
            hasNextPage: ITEMS_PER_PAGE * pageNum < totalDocs,
            hasPreviousPage: pageNum > 1,
            currentPage: pageNum,
            nextPage: pageNum + 1,
            prevPage: pageNum - 1,
            lastPage: Math.ceil(totalDocs / ITEMS_PER_PAGE)
          });
        });
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
};

// /products/123 => GET (for details btn)
exports.getProduct = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;

  const prodId = req.params.productID;
  Product.findById(prodId, (err, product) => {
    return res.render("shop/product-detail.ejs", {
      product: product,
      pageTitle: product.title,
      path: "/products"
    });
  });
};

//  /cart => GET
exports.getCart = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (!isLogged) {
    return res.redirect("/");
  }
  let cartPrice = 0;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      products = user.cart.items;
      products.forEach(product => {
        cartPrice += product.productId.price * product.quantity;
      });
      return res.render("shop/cart.ejs", {
        pageTitle: "Your Cart",
        path: "/cart",
        prods: products,
        totalPrice: cartPrice
      });
    })
    .catch(err => next(err));
};

//  /cart => POST
exports.postCart = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (!isLogged) {
    return res.redirect("/");
  }
  let id = req.body.productID;

  Product.findById(id)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      return res.redirect("/cart");
    })
    .catch(err => next(err));
};

//  /cart/delete/2 => POST
exports.postDelCartProd = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (!isLogged) {
    return res.redirect("/");
  }
  let id = req.params.productID;
  const productIndex = req.user.cart.items.findIndex(cartProduct => {
    return cartProduct.productId.toString() === id;
  });
  req.user.cart.items.splice(productIndex, 1);
  req.user.save();
  return res.redirect("/cart");
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
    .catch(err => next(err));
};

exports.getInvoice = (req, res, next) => {
  const id = req.params.invoiceId;
  const invoiceName = "invoice-" + id + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);
  const pdfDoc = new PDFdoc();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${invoiceName}`);
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);
  pdfDoc.text("hi this is newly generated pdf");
  pdfDoc.end();
  //const readStream = fs.createReadStream(invoicePath);
  // return readStream.pipe(res);
};
