const express = require('express');
const router = express.Router();
const { guardarFormulario } = require('./leadFormController');

router.post('/', guardarFormulario);

module.exports = router;