const express = require('express');

const abhayaController = require('../controller/abhaya.controller');

const AuthCheck = require('../middleware/AuthCheck');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();


// admin

router.get('/', abhayaController.landingPageView);

router.get('/about', abhayaController.aboutPageView);

router.get('/features', abhayaController.featuresPageView);

router.get('/safety-tips', abhayaController.safetyTipsPageView);



module.exports = router;