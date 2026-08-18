const express = require('express');

const userController = require('../controller/user.controller');

const AuthCheck = require('../middleware/AuthCheck');
const roleCheck = require('../middleware/roleCheck');

const profileImage = require("../utils/cloudinary");

const passport = require("passport");
const { State, City } = require("country-state-city");

const router = express.Router();



// user

router.get('/dashboard', AuthCheck, userController.userdashboard);

router.get("/profile", AuthCheck, userController.userProfileView);

router.post("/verify/:id", AuthCheck, roleCheck('admin'), userController.userVerify);

router.post("/status/:id", AuthCheck, roleCheck('admin'), userController.userStatus);

router.get("/delete/:id", AuthCheck, roleCheck('admin'), userController.userDelete);

router.get("/restore-view", AuthCheck, roleCheck('admin'), userController.userRestoreView);

router.get("/restore/:id", AuthCheck, roleCheck('admin'), userController.userRestore);

router.get("/safetytips",  AuthCheck, userController.safetyTipsView);

router.get("/location",  AuthCheck, userController.locationView);

router.get("/settings",  AuthCheck, userController.settingsView);

router.get('/all', AuthCheck, roleCheck('admin'), userController.allUsers);



module.exports = router;