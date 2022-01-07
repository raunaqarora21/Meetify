const express = require('express');
const route = express.Router();

const { checkAuthenticated } = require("../security_functions/authenFunc");
const { v4: uuidV4 } = require("uuid");
route.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

module.exports = route;