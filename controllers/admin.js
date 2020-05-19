const Product = require("../models/product");
const { validationResult } = require("express-validator/check");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// /admin/add-product => GET
exports.getAddProducts = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (!isLogged) {
    return res.redirect("/");
  }
  let isEditable = false;
  res.render("admin/product-fields.ejs", {
    pageTitle: "Add Product",
    edit: isEditable,
    path: "/admin/add-product",
    error: false
  });
};

// /admin/add-product => POST
exports.postAddProducts = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (!isLogged) {
    return res.redirect("/");
  }
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.render("admin/product-fields.ejs", {
      pageTitle: "Add Product",
      edit: false,
      path: "/admin/add-product",
      error: error.errors[0].msg
    });
  }
  const image = req.file;
  const title = req.body.title;
  const price = req.body.price;
  const desc = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    imageUrl: image.path,
    description: desc,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      return res.redirect("/");
    })
    .catch(err => {
      console.log(err);
      return next(err);
    });
};

exports.getEditProducts = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (!isLogged) {
    return res.redirect("/");
  }
  const isEditable = req.query.edit;
  const id = req.params.productID;
  Product.findById(id, (err, product) => {
    if (err) {
      next(err);
    }
    return res.render("admin/product-fields.ejs", {
      pageTitle: "Edit Product",
      edit: isEditable,
      path: "/admin/edit/",
      product: product,
      error: false
    });
  });
};

exports.postEditProducts = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (!isLogged) {
    return res.redirect("/");
  }
  const enteredProduct = req.body;
  enteredProduct._id = req.params.productID;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.render("admin/product-fields.ejs", {
      pageTitle: "Add Product",
      edit: true,
      path: "/admin/add-product",
      error: error.errors[0].msg,
      product: enteredProduct
    });
  }
  const id = req.params.productID;
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const desc = req.body.description;
  Product.findById(id).then(product => {
    console.log(product);
    if (image) {
      let path = product.imageUrl;
      fs.unlink(path, err => {});
      product.imageUrl = image.path;
    }
    product.title = title;
    product.price = price;
    product.description = desc;
    product
      .save()
      .then(() => {
        return res.redirect("/admin/products");
      })
      .catch(error => next(error));
  });
};

// /admin/products => GET
exports.getProducts = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (!isLogged) {
    return res.redirect("/");
  }
  Product.find({ userId: req.user._id })
    .then(products => {
      return res.render("admin/admin-products.ejs", {
        prods: products,
        pageTitle: "shop",
        path: "/admin/edit/"
      });
    })
    .catch(err => next(err));
};

exports.deleteProduct = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (!isLogged) {
    return res.redirect("/");
  }
  let id = req.params.productId;
  Product.findOne({ _id: id })
    .then(product => {
      let path = product.imageUrl;
      fs.unlink(path, err => {});
      return product.remove();
    })
    .then(result => {
      return res.status(200).json({ msg: "success" });
    })
    .catch(err => {
      return res.status(500).json({ msg: "failed" });
    });
};
