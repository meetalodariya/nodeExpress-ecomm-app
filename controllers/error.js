exports.get404 = (req, res, next) => {
  return res.status(404).render("404.ejs", { pageTitle: "Oops!", path: "" });
};

exports.get500 = (error, req, res, next) => {
  return res
    .status(500)
    .render("500.ejs", { pageTitle: "Oops!", path: "", isAuth: false });
};
