const {Router} = require("express");

module.exports = Router()
.use("/auth", require("./auth-routes"))