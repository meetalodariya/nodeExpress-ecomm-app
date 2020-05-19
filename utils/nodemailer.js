const sgMail = require("@sendgrid/mail");

const API_KEY =
  "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";

sgMail.setApiKey(API_KEY);

module.exports = sgMail;
