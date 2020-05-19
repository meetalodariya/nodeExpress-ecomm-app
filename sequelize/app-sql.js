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
const sequelize = require("./utils/database");

//model Imports
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-items");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

//configuration
app.use(bodyParser.urlencoded({ extended: false })); //to parse the body of incoming request
app.use(express.static(path.join(__dirname, "public"))); //To statically access assets

//user object injection to req object
app.use((req, res, next) => {
  User.findOne()
    .then(user => {
      req.user = user;
      next();
    })
    .catch();
});

//Routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);

//error page
app.use(errorCon.get404);

//Database Relationships
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User); //adds connection column to cart(target)  //same as Cart.belongsTo(User) but conn col to User(source)
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

//db setup - init
sequelize
  // .sync({ force: true })
  .sync()
  .then(result => {
    return User.findOne();
  })
  .then(user => {
    if (user === null) {
      return User.create({ name: "meet", email: "meetalodariya45@gmail.com" });
    }
    return user;
  })
  .then(user => {
    user.getCart().then(cart => {
      if (cart === null) {
        return user.createCart({ totalPrice: 0.0 });
      }
    });
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch();
