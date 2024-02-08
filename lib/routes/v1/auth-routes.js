const {Router} = require("express");
const { signup, login, forgotPassword, changePassword } = require("../../controllers/auth-controller");
const { authenticateMiddleware } = require("../../middlewares/auth-middleware");

module.exports = Router()
.post("/signup", signup)
.post("/login", login)
.post("/forgot-password", forgotPassword)
.put("/change-password", authenticateMiddleware, changePassword)