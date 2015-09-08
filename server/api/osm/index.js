'use strict';

var express = require('express');
var controller = require('./osm.controller');

var router = express.Router();

router.post('/', controller.index);
router.get('/makes', controller.getMakes);
router.post('/cars', controller.getCars);
module.exports = router;
