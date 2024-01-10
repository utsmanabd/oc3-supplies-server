const express = require('express');
const router = express.Router();
const AuthController = require('../../controller/auth_controller/AuthController')

router.post('/login', AuthController.login)
router.post('/update-token', AuthController.updateToken)

module.exports = router;