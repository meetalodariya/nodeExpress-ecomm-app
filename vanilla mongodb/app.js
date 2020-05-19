const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

//rendering engine config
app.set("view engine", "ejs");
app.set("views", "views");

//Module imports
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorCon = require("./controllers/error");
const mongoDB = require("./utils/database");

//model Imports
//const Product = require("./models/product");
const User = require("./models/user");

//configuration
app.use(bodyParser.urlencoded({ extended: false })); //to parse the body of incoming request
app.use(express.static(path.join(__dirname, "public"))); //To statically access assets

// user object injection to req object
app.use((req, res, next) => {
  User.findById("5e692f3f83637c0b66a73400")
    .then(user => {
      console.log(user);
      req.user = new User(user._id, user.name, user.email, user.cart);
      next();
    })
    .catch();
});

//Routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);

//error page
app.use(errorCon.get404);

mongoDB.connect(status => {
  console.log("connected: ", status);
  app.listen(3000);
});
