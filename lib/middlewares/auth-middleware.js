const jwt = require("jsonwebtoken")
const { userModel } = require("../models/user-model");
const {
  UNAUTHORIZED,
  TWO,
  ZERO,
  BEARER,
  INTERNAL_SERVER_ERROR,
  ONE,
} = require("../utils/status-codes");

exports.authenticateMiddleware = async function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(UNAUTHORIZED)
      .send("No authorization token specified in headers");
  }

  const splittedAuthHeader = authHeader?.split(" ");

  if (
    splittedAuthHeader.length != TWO ||
    splittedAuthHeader[ZERO].toString().toLowerCase() != BEARER
  ) {
    return res
      .status(UNAUTHORIZED)
      .send(
        "Invalid authorization header specified.\nIt must be a bearer auth token"
      );
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(splittedAuthHeader[ONE], process.env.JWT_KEY);
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send(error.message);
    return;
  }

  if (
    !decodedToken.hasOwnProperty("_id") ||
    !decodedToken.hasOwnProperty("expirationDate")
  ) {
    res.status(UNAUTHORIZED).send("Invalid authentication credentials.");
    return;
  }

  const { _id, expirationDate } = decodedToken;

  if (!_id || !expirationDate) {
    return res.status(UNAUTHORIZED).send("Invalid data sent");
  }

  if (expirationDate < new Date()) {
    return res.status(UNAUTHORIZED).send("Token has expired.");
  }

  let user = await userModel.findById(_id);

  if (!user) {
    return res.status(UNAUTHORIZED).send("Invalid authentication credentials.");
  }

  if (!user.isOnline) {
    await userModel.updateOne(
      { _id: _id },
      { isOnline: true, accessToken: splittedAuthHeader[ONE] }
    );
  }

  req.user = user;

  next();
};
