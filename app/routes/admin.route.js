const express = require('express');

const adminController = require('../controller/admin.controller');

const AuthCheck = require('../middleware/AuthCheck');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();


// admin

router.get('/dashboard', AuthCheck, roleCheck('admin'), adminController.admindashboard);



module.exports = router;