const express = require("express");
const route = express.Router();
const { checkAuthenticated } = require("../security_functions/authenFunc");

route.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { tabName: "Microsoft Teams", user: req.user });
});


module.exports = route;