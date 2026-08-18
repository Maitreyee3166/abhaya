const express = require('express');

const contactController = require('../controller/contact.controller');

const AuthCheck = require('../middleware/AuthCheck');
const roleCheck = require('../middleware/roleCheck');

const { State, City } = require("country-state-city");


const router = express.Router();


// contact

router.get("/support", contactController.contactSupportPageView);

router.post("/support-create", contactController.messageCreate);

router.get("/all", AuthCheck, roleCheck('user'), contactController.contactView);

router.get("/add-view", AuthCheck, roleCheck('user'), contactController.contactCreateView);

router.get("/cities/:stateCode", AuthCheck, roleCheck('user'), contactController.contactCreateCity);

router.post("/add", AuthCheck, roleCheck('user'), contactController.contactCreate);


module.exports = router;