const express = require("express");
const { check, body } = require("express-validator/check");
const User = require("../models/user");

const router = express.Router();

const authController = require("../controllers/auth");

router.get("/login", authController.getAuth);

router.post(
  "/login",
  [check("login").normalizeEmail(), body("password").trim()],
  authController.postAuth
);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Email is invalid")
      .custom((val, { req }) => {
        return User.findOne({ email: val }).then(user => {
          if (user) {
            throw new Error("User already exists");
          }
        });
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password should be atleast 5 characters long")
      .isAlphanumeric()
      .trim(),
    body("confPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords are not matching");
        } else return true;
      })
  ],
  authController.postSignup
);

router.post("/logout", authController.logOut);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:id", authController.getResetPass);

router.post("/new_pass", authController.postNewPass);

module.exports = router;
