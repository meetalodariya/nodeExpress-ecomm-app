const Product = require("../models/product");
const Cart = require("../models/cart");
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

  Product.findOne({ where: { id: id } })
    .then(product => {
      return res.render("admin/product-fields.ejs", {
        pageTitle: "Edit Product",
        edit: isEditable,
        path: "/admin-products",
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

  Product.findOne({ where: { id: id } }).then(product => {
    product.title = title;
    product.imageURL = imageUrl;
    product.price = price;
    product.description = desc;
    return product.save();
  });
  res.redirect("/admin/products");
};

// /admin/add-product => POST
exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const desc = req.body.description;
  req.user
    .createProduct({
      title: title,
      imageURL: imageUrl,
      price: price,
      description: desc,
      userId: req.user.id
    })
    //Product.create()
    .then(result => console.log(result))
    .catch(err => console.log(err));
  res.redirect("/");
};

// /admin/products => GET
exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      return res.render("admin/admin-products.ejs", {
        prods: products,
        pageTitle: "shop",
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
  let id = req.body.productID;
  Product.findOne({ where: { id: id } })
    .then(product => {
      return product.destroy();
    })
    .catch(err => console.log(err));

  return res.redirect("/admin/products");
};
