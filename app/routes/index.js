const express = require('express');


const authController = require('./auth.route')
const userController = require('./user.route');
const adminController = require('./admin.route');
const reportIncidentController = require('./reportincident.route')
const policeController = require('./police.route')
const sosController = require('./sos.route');
const contactController = require('./contact.route');
const chatController = require('./chat.route');
const abhayaController = require('./abhaya.route');

const router = express.Router();



// abhaya

router.use('/abhaya', abhayaController);


// auth

router.use('/auth', authController);


// user

router.use('/user', userController);


// admin 

router.use('/admin', adminController);


// police

router.use('/police', policeController);


// reportIncident

router.use("/report", reportIncidentController);


// sos

router.use('/sos', sosController);


// contact

router.use('/contact', contactController);


// chat

router.use('/chat', chatController);


module.exports = router;