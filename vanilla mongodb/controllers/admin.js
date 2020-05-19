const Product = require("../models/product");

// /admin/add-product => GET
exports.getAddProducts = (req, res, next) => {
  let isEditable = false;
  res.render("admin/product-fields.ejs", {
    pageTitle: "Add Product",
    edit: isEditable,
    path: "/admin/add-product"
  });
};

exports.getEditProducts = (req, res, next) => {
  const isEditable = req.query.edit;
  const id = req.params.productID;
  console.log("edit");
  Product.findById(id)
    .then(product => {
      return res.render("admin/product-fields.ejs", {
        pageTitle: "Edit Product",
        edit: isEditable,
        path: "/admin/edit/",
        product: product
      });
    })
    .catch();
};

exports.postEditProducts = (req, res, next) => {
  const id = req.params.productID;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const desc = req.body.description;
  let product = new Product(title, price, imageUrl, desc, id);
  product
    .save()
    .then(result => {
      console.log(result);
      return res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

// /admin/add-product => POST
exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const desc = req.body.description;
  const product = new Product(title, price, imageUrl, desc, null, req.user._id);
  product
    .save()
    .then(result => {
      console.log(result);
      return res.redirect("/");
    })
    .catch(err => console.log(err));
};

// /admin/products => GET
exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      return res.render("admin/admin-products.ejs", {
        prods: products,
        pageTitle: "shop",
        path: "/admin/edit/"
      });
    })
    .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
  let id = req.body.productID;
  Product.deleteById(id);

  return res.redirect("/admin/products");
};
