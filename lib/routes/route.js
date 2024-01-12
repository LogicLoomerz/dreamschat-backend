const {Router, json, urlencoded} = require("express");

module.exports = Router()
.use(json())
.use(urlencoded({extended: false}))
.use("/v1.0", require("./v1"));