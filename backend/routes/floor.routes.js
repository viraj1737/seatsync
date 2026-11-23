const express = require('express');
const router = express.Router();
const floorController = require('../controllers/floor.controller');
const requireAuth = require('../middleware/requireAuth');

router.get('/', requireAuth, floorController.getFloors);

module.exports = router;
