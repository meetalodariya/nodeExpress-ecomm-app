const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const app = express();

const MONGODB_URI =
  "mongodb://meet:1sSJFLRoMa1ZuPsj@cluster0-shard-00-00-nptjv.mongodb.net:27017,cluster0-shard-00-01-nptjv.mongodb.net:27017,cluster0-shard-00-02-nptjv.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

//rendering engine config
app.set("view engine", "ejs");
app.set("views", "views");

//Module imports
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorCon = require("./controllers/error");
const nodemailer = require("./utils/nodemailer");
//model Imports
//const Product = require("./models/product");
const User = require("./models/user");

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//configuration
//to parse the body of incoming request
app.use(bodyParser.urlencoded({ extended: false }));
// to parse an image from the form being submitted
app.use(
  multer({ storage: imageStorage, fileFilter: filefilter }).single("image")
);
//To statically access assets
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

const csrfProtection = csrf({});
const store = new MongoDBStore({ uri: MONGODB_URI, collection: "session" });

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    store: store
  })
);

app.use(csrfProtection);
app.use(flash());

// user object injection to req object
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch();
});

app.use((req, res, next) => {
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
//Routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//error pages
app.use(errorCon.get404);
app.use(errorCon.get500);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch();
