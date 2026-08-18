const User = require('../models/user');
const Role = require("../models/role");
const ReportIncident = require("../models/report");
const Police = require("../models/police");

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { createAccessToken, createRefreshToken } = require("../utils/createToken");
const sendEmail = require('../utils/sendEmail');
const sendForgotPasswordEmail = require('../utils/sendForgotMail');
const logger = require('../utils/logger');


class AuthController {

    async CheckAuth(req, res, next) {
        try {
            if (req.user) {
                next()
            } else {
                res.redirect('/auth/login')
            }
        } catch (error) {

            logger.error(error);
        }
    }

    userRegisterView(req, res) {
        return res.render('user/register');
    }

    async userRegisterCreate(req, res) {
        try {
            const { fullName, email, phone, password, dob, gender, state, district, city } = req.body;

            const existingUser = await User.findOne({ email });

            if (existingUser) {

                logger.info("User already exist");
                req.flash("error", "User already exist");
                return res.redirect('/auth/register');
            }

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
                {
                    headers: {
                        "User-Agent": "Abhaya-App"
                    }
                }
            );

            const data = await response.json();

            if (data.length === 0) {
                return res.send("Location not found.");
            }

            const latitude = parseFloat(data[0].lat);
            const longitude = parseFloat(data[0].lon);


            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            // const userDob = new Date(req.body.dob);

            // const today = new Date();
            // let age = today.getFullYear() - userDob.getFullYear();

            // const monthDiff = today.getMonth() - userDob.getMonth();

            // if (
            //     monthDiff < 0 ||
            //     (monthDiff === 0 && today.getDate() < userDob.getDate())
            // ) {
            //     age--;
            // }

            // let role;

            // if (age >= 18) {
            //     role = "user";
            // } else {
            //     role = "child";
            // }

            const userRole = await Role.findOne({ roleName: "user" });

            const userData = new User({
                fullName, email, phone, password: hashPassword, dob, gender, roleId: userRole._id, state,
                district,
                city,
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            });

            if (req.file) {

                userData.image = req.file.path;
                userData.cloudinaryId = req.file.filename;
            }

            const result = await userData.save();

            if (result) {

                logger.info("User registered successfully!")
                req.flash(
                    "success",
                    "Registration successful. Your account is waiting for admin verification."
                );
                return res.redirect("/auth/register");
            }

        } catch (error) {

            logger.error(error);
            req.flash("error", "Something went wrong");
            return res.redirect('/auth/register');
        }
    }

    userLoginView(req, res) {

        return res.render('user/userlogin')
    }

    async userLoginCreate(req, res) {
        try {
            const { email, password } = req.body;

            // console.log(req.body);

            if (!email || !password) {

                logger.warn("All fileds required");
                req.flash("error", "All fileds required");
                return res.redirect("/auth/login");
            }

            const existingUser = await User.findOne({ email }) || await Police.findOne({ email });

            if (!existingUser) {

                logger.warn("User not found");
                req.flash("error", "User not found");
                return res.redirect("/auth/login");
            }

            // console.log(existingUser);

            const isMatch = await bcrypt.compare(password, existingUser.password);

            // console.log(isMatch);

            const role = await Role.findOne(existingUser.roleId);

            // console.log(role);

            if (!isMatch) {

                logger.warn("Invalid credentials");
                req.flash("error", "Invalid password");
                return res.redirect("/auth/login");
            }

            // ACCESS TOKEN
            const accessToken = createAccessToken({
                id: existingUser._id,
                name: existingUser.fullName,
                email: existingUser.email,
                role: role.roleName,

            });

            // REFRESH TOKEN
            const refreshToken = createRefreshToken({
                id: existingUser._id,
                name: existingUser.fullName,
                email: existingUser.email,
                role: role.roleName,

            });

            existingUser.refreshToken = refreshToken;

            await existingUser.save();

            // Cookies
            res.cookie("token", accessToken, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000,
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            // const cookieOptions = {
            //     expires: new Date(Date.now() + expiresIn * 1000),
            //     httpOnly:true
            // }

            if (role.roleName === 'user') {

                req.flash("success", "welcome to User dashboard!");
                return res.redirect("/user/dashboard");
            } else if (role.roleName === 'admin') {

                req.flash("success", "welcome to Admin dashboard!");
                return res.redirect("/admin/dashboard");
            } else if (role.roleName === 'police') {

                req.flash("success", "welcome to Police dashboard!");
                return res.redirect("/police/dashboard");
            }

        } catch (error) {

            logger.error(error);
            req.flash("error", "Something went wrong");
            return res.redirect("/auth/login");
        }
    }

    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.redirect("/auth/login");
            }

            // Verify refresh token
            const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN
            );

            // console.log("Decoded refresh token:", decoded);

            let account;
            let accessToken;
            let redirectUrl;


            if (decoded.role === "user") {

                account = await User.findOne({
                    _id: decoded.id,
                    refreshToken: refreshToken
                });

                if (!account) {
                    console.log("User not found");
                    return res.redirect("/auth/login");
                }

                const role = await Role.findById(account.roleId);

                if (!role) {
                    console.log("Role not found");
                    return res.redirect("/auth/login");
                }

                accessToken = createAccessToken({
                    id: account._id,
                    name: account.fullName,
                    email: account.email,
                    role: role.roleName
                });

                redirectUrl =
                    req.cookies.redirectAfterRefresh ||
                    "/user/dashboard";
            }

            else if (decoded.role === "police") {

                account = await Police.findOne({
                    _id: decoded.id,
                    refreshToken: refreshToken
                });

                if (!account) {
                    console.log("Police not found");
                    return res.redirect("/auth/login");
                }

                accessToken = createAccessToken({
                    id: account._id,
                    name: account.fullName,
                    email: account.email,
                    role: "police"
                });

                redirectUrl =
                    req.cookies.redirectAfterRefresh ||
                    "/police/dashboard";
            }

            else if (decoded.role === "admin") {

                account = await User.findOne({
                    _id: decoded.id,
                    refreshToken: refreshToken
                });

                if (!account) {
                    console.log("Admin not found");
                    return res.redirect("/auth/login");
                }

                accessToken = createAccessToken({
                    id: account._id,
                    name: account.fullName,
                    email: account.email,
                    role: "admin"
                });

                redirectUrl =
                    req.cookies.redirectAfterRefresh ||
                    "/admin/dashboard";
            }

            else {
                console.log("Invalid role:", decoded.role);
                return res.redirect("/auth/login");
            }

            res.cookie("token", accessToken, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000
            });

            // Remove redirect cookie
            res.clearCookie("redirectAfterRefresh");

            return res.redirect(redirectUrl);

        } catch (error) {

            logger.error(error);
            return res.redirect("/auth/login");
        }
    }

    // async googleLoginSuccess(req, res) {
    //     try {

    //         const profile = req.user;

    //         let user = await User.findOne({
    //             email: profile.emails[0].value
    //         });

    //         if (!user) {
    //             logger.warn("User does not exist");
    //             return res.redirect('/auth/register')

    //         }

    //         req.session.user = user;

    //         return res.redirect("/user/dashboard");

    //     } catch (error) {

    //         logger.error(error);
    //         return res.redirect("/auth/login");

    //     }
    // };

    viewforgotPassword(req, res) {
        return res.render("user/forgot_password");
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            const findUser = await User.findOne({ email });

            // console.log(findUser);

            if (!findUser) {
                req.flash("error", "User not found");
                return res.redirect("/auth/forget-password/view");
            }

            // Create Secret
            const secret =
                findUser._id +
                process.env.RESET_PASSWORD +
                findUser.password;

            // Generate Token
            const token = jwt.sign(
                {
                    id: findUser._id,
                },
                secret,
                {
                    expiresIn: "1d",
                },
            );

            // Reset Link
            const resetLink = `http://localhost:3006/auth/reset-password/${findUser._id}/${token}`;

            // console.log(findUser);

            // Send Email
            await sendForgotPasswordEmail(req, findUser, resetLink);

            req.flash("success", "Password reset link has been sent to your email.");
            return res.redirect("/auth/login");

        } catch (error) {

            console.log(error);
            req.flash("error", "Something went wrong");
            return res.redirect("/auth/forget-password/view");
        }
    }

    async viewResetPassword(req, res) {

        const { id, token } = req.params;

        const findUser = await User.findById(id);

        if (!findUser) {
            req.flash("error", "User not found");
            return res.redirect("/auth/login");
        }

        // console.log(findUser);

        const secret =
            findUser._id + process.env.RESET_PASSWORD + findUser.password;

        try {
            jwt.verify(token, secret);
            return res.render("user/reset_password", {
                id,
                token,
            });

        } catch (error) {
            req.flash("error", "Reset link has expired.");
            return res.redirect("/auth/login");
        }
    }

    async resetPassword(req, res) {
        try {

            const { password, confirmPassword } = req.body;
            const { id, token } = req.params;

            if (password !== confirmPassword) {
                req.flash("error", "Passwords do not match");
                return res.redirect(`/auth/reset-password/${id}/${token}`);
            }

            const findUser = await User.findById(id);

            if (!findUser) {
                req.flash("error", "User not found");
                return res.redirect("/auth/login");
            }

            // try {
            // jwt.verify(token, secret);
            // } catch (error) {
            //     req.flash("error", "Invalid or expired link");
            //     return res.redirect("/web/view/login");
            // }

            const hashPassword = await bcrypt.hash(password, 10);
            findUser.password = hashPassword;
            await findUser.save();

            req.flash("success", "Password updated successfully");
            return res.redirect("/auth/login");
        } catch (error) {
            logger.error(error);
            req.flash("error", "Something went wrong");
            return res.redirect("/auth/login");
        }
    }

    logout(req, res) {
        res.clearCookie('token');
        res.redirect('/auth/login');
    }
}


module.exports = new AuthController()