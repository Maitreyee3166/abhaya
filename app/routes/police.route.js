const express = require('express');

const policeController = require('../controller/police.controller');

const profileImage = require("../utils/cloudinary");

const AuthCheck = require('../middleware/AuthCheck');
const roleCheck = require('../middleware/roleCheck');
const validateWeb = require('../middleware/apiValidate');

const {policeSchemaValidation} = require('../validation/authValidation');

const router = express.Router();


// admin


router.get('/dashboard', AuthCheck, roleCheck('police'), policeController.policeDashboard);

router.get('/all', AuthCheck, roleCheck('admin'), policeController.allPolice);
router.get('/create', AuthCheck, roleCheck('admin'), policeController.policeCreateView);
router.post('/add', AuthCheck, roleCheck('admin'), profileImage.single('image'), validateWeb(policeSchemaValidation, "/police/create"), policeController.addPolice);


module.exports = router;