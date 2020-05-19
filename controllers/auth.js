const User = require("../models/user");
const bcrypt = require("bcrypt");
const sgMail = require("../utils/nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator/check");

exports.getAuth = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;
  if (isLogged) {
    return res.redirect("/");
  }
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  return res.render("auth/login.ejs", {
    path: "/login",
    pageTitle: "Login",
    isAuth: isLogged,
    csrfToken: req.csrfToken(),
    errorAuth: message
  });
};

exports.postAuth = (req, res, next) => {
  const email = req.body.login;
  const password = req.body.password;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash("error", "Invalid Email or Password");
        return res.redirect("/login");
      } else {
        bcrypt.compare(password, user.password).then(doMatch => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save();
            return res.redirect("/");
          } else {
            req.flash("error", "Invalid Email or Password");
            return res.redirect("/login");
          }
        });
      }
    })
    .catch(err => console.log(err));
};

exports.getSignup = (req, res, next) => {
  const isLogged = req.session.isLoggedIn;

  res.render("auth/signup.ejs", {
    path: "/signup",
    pageTitle: "Signup",
    isAuth: isLogged,
    email: null,
    error: null
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confPassword = req.body.confPassword;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.render("auth/signup.ejs", {
      path: "/signup",
      pageTitle: "Signup",
      error: error.errors[0].msg,
      email: email
    });
  }
  return bcrypt.hash(password, 12).then(encPass => {
    const user = new User({
      name: email,
      email: email,
      password: encPass,
      cart: { items: [] }
    });
    user.save().then(res.redirect("/login"));
    return sgMail.send({
      from: '"shop.com" <no-reply@myshop.com>',
      to: email,
      subject: "Sign up successful",
      text: "Sing up successfull",
      html: "<b>Congrats! You are signed up successfully</b>"
    });
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset.ejs", {
    path: "/reset",
    pageTitle: "Reset Password",
    csrfToken: req.csrfToken(),
    errorAuth: message
  });
};

exports.postReset = (req, res, next) => {
  let email = req.body.login;
  User.findOne({ email: email }).then(user => {
    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/reset");
    }
    crypto.randomBytes(16, (err, buff) => {
      const token = buff.toString("hex");
      user.resetToken = token;
      user.resetTokenExp = Date.now() + 3600000;
      user.save();
      res.redirect("/");
      return sgMail.send({
        from: '"shop.com" <no-reply@myshop.com>',
        to: email,
        subject: `Reset password for ${email}`,
        text: "reset link",
        html: `
            <p>Password reset link </p>
              <a href="http://localhost:3000/reset/${user.id}?ts=${token}" style="background-color:#333333;border:1px solid #333333;border-color:#333333;border-radius:6px;border-width:1px;color:#ffffff;display:inline-block;font-size:14px;font-weight:normal;letter-spacing:0px;line-height:normal;padding:12px 18px 12px 18px;text-align:center;text-decoration:none;border-style:solid" target="_blank" >Click here</a>
          `
      });
    });
  });
};

exports.getResetPass = (req, res, next) => {
  const id = req.params.id;
  const ts = req.query.ts;
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  User.findOne({ _id: id }).then(user => {
    if (!user || ts !== user.resetToken) {
      return res
        .status(404)
        .render("404.ejs", { pageTitle: "Oops!", path: "" });
    } else if (user.resetTokenExp < Date.now()) {
      return res.send("token expired!Try again");
    } else {
      res.render("auth/new-pass.ejs", {
        path: "/reset",
        pageTitle: "New Password",
        csrfToken: req.csrfToken(),
        errorAuth: message,
        userId: user.id,
        passToken: ts
      });
    }
  });
};

exports.postNewPass = (req, res, next) => {
  const id = req.body._id;
  const pass = req.body.password;
  const token = req.body.passToken;
  User.findOne({
    _id: id,
    resetToken: token,
    resetTokenExp: { $gt: Date.now() }
  }).then(user => {
    if (!user) {
      return res
        .status(404)
        .render("404.ejs", { pageTitle: "Oops!", path: "" });
    }
    bcrypt.hash(pass, 12).then(encPass => {
      user.password = encPass;
      user.resetTokenExp = 0;
      user.resetToken = null;
      user.save().then(() => {
        return res.redirect("/login");
      });
    });
  });
};

exports.logOut = (req, res, next) => {
  req.session.destroy(err => {
    res.redirect("/");
  });
};
