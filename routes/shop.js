const express = require("express");
const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getHomePage);

router.get("/checkout", shopController.getHomePage);

router.get("/products", shopController.getProducts);

router.get("/products/:productID", shopController.getProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/cart/delete/:productID", shopController.postDelCartProd);

router.post("/create-order", shopController.postOrder);

router.get("/invoice/:invoiceId", shopController.getInvoice);
module.exports = router;
