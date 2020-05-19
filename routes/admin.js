const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();
const { body } = require("express-validator/check");

router.get("/add-product", adminController.getAddProducts);

router.post(
  "/add-product",
  [
    body("title")
      .trim()
      .matches("^[a-zA-Z0-9 ]*$")
      .withMessage("Enter a valid title."),
    body("description")
      .trim()
      .isLength({ min: 4, max: 300 })
      .withMessage("Description should be between 4 to 400 characters")
  ],
  adminController.postAddProducts
);

router.delete("/delete/:productId", adminController.deleteProduct);

router.post(
  "/edit/:productID",
  [
    body("title")
      .trim()
      .matches("^[a-zA-Z0-9 ]*$")
      .withMessage("Enter a valid title."),

    body("description")
      .trim()
      .isLength({ min: 4, max: 300 })
      .withMessage("Description should be between 4 to 400 characters")
  ],
  adminController.postEditProducts
);

router.get("/edit/:productID", adminController.getEditProducts);

router.get("/products", adminController.getProducts);

module.exports = router;
