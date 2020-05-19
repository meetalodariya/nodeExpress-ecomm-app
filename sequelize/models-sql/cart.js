const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Cart = sequelize.define("cart", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  totalPrice: {
    type: Sequelize.DOUBLE
  }
});

module.exports = Cart;
