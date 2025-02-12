const express = require('express');
const router = express.Router();
const { helloWorld, getHubSpotProperties } = require('./helloWorldController');

router.get('/', helloWorld);
router.get('/hubspot-properties', getHubSpotProperties);

module.exports = router;
