const express = require('express');
const route = express.Router();
const { checkAuthenticated } = require("../security_functions/authenFunc");
const room = require("../db/schemas/room.js");
//Video Display
route.get("/:room", checkAuthenticated, async (req, res) => {
  const roomData = await room.findOne({ roomId: req.params.room }).exec();
  // console.log(req.user);
  res.render("room", {
    tabName: "Microsft Teams",
    count: roomData ? roomData.count : 0,
    layout: "layouts/videoLayout",
    roomId: req.params.room,
    screen: req.query.screen,
    user: req.user,
  });
});

module.exports = route;

module.exports = route;