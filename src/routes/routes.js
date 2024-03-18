const express = require('express');
const router = express.Router();
const path = require('path');

const AuthRoutes = require('./utility_routes/auth.routes')
const MasterRoutes = require('./master_routes/master.routes')
const FileRoutes = require('./utility_routes/files.routes')
const auth = require('../services/auth.service')

// not found route
router.get('/not-found', function(req, res) {
    res.status(404).sendFile(path.join(__dirname, '../views/not-found.html'));
});

// authentication routes usage 
router.use('/auth/', AuthRoutes);

router.use('/file/', FileRoutes)

// master data routes usage 
router.use('/master/', auth.verifyToken, MasterRoutes);

module.exports = router;