const express = require('express');

const authController = require('../controller/auth.controller');

const AuthCheck = require('../middleware/AuthCheck');
const roleCheck = require('../middleware/roleCheck');
const validateWeb = require('../middleware/apiValidate');

const {registerSchemaValidation, loginSchemaValidation, forgotPasswordValidation, resetPasswordValidation} = require('../validation/authValidation');

const profileImage = require("../utils/cloudinary");

const passport = require("passport");

const router = express.Router();


// router.get('/woman-safety', authController.landingPageView);

// auth

router.get('/register', authController.userRegisterView);
router.post('/register/create', validateWeb(registerSchemaValidation, "/auth/register"), profileImage.single('image'), authController.userRegisterCreate);

router.get('/login', authController.userLoginView);
router.post('/login/create', validateWeb(loginSchemaValidation, "/auth/login"), authController.userLoginCreate);

router.get("/refresh-token", authController.refreshToken);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/forget-password/view", authController.viewforgotPassword);
router.post(
  "/forget-password/create",
  validateWeb(forgotPasswordValidation, "/auth/forgot-password/view"),
  authController.forgotPassword
);

router.get("/reset-password/:id/:token", authController.viewResetPassword);
router.post(
  "/reset-password/:id/:token",
  // validateWeb(resetPasswordValidation, "/auth/reset-password/:id/:token"),
  authController.resetPassword,
);

// Google Callback
// router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/auth/login" }), authController.googleLoginSuccess);

router.get('/logout', AuthCheck, authController.CheckAuth, authController.logout);


module.exports = router;