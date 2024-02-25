const {Router} = require('express');
const { updateProfile } = require('../../controllers/user-controller');
const { authenticateMiddleware } = require('../../middlewares/auth-middleware');

module.exports = Router()
    .put('/update-user', authenticateMiddleware, updateProfile);