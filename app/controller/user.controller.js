const User = require('../models/user');
const Role = require('../models/role');
const Police = require('../models/police');
const Contact = require('../models/contact');
const { State, City } = require("country-state-city");
const { default: mongoose } = require('mongoose');
const { rawListeners } = require('../models/sos');
const Sos = require('../models/sos');
const SosCase = require('../models/soscase');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

class UserController {

    async userProfileView(req, res) {
        const userData = await User.findById(req.user.id) || await Police.findById(req.user.id);

        const role = await Role.findById(userData.roleId);

        if (req.user.role === "admin") {

            userData.formattedDob = new Date(userData.dob)
            .toISOString()
            .split("T")[0];

            return res.render('admin/profile', {
                userData,
                role
            })
        } else if (req.user.role === "police") {
            return res.render('police/profile', {
                userData,
                role
            })
        } else {

            userData.formattedDob = new Date(userData.dob)
            .toISOString()
            .split("T")[0];
            
            return res.render('user/profile', {
                userData,
                role
            })
        }
    }

    locationView(req, res) {

        res.render("user/location", {
            userData: req.user

        });
    }

    safetyTipsView(req, res) {

        // const role = await Role.findById(userData.roleId);

        if (req.user.role === "user") {
            return res.render('user/safety_tips', {
                userData: req.user
            })
        } else if (req.user.role === "admin") {
            return res.render('admin/safety_tips', {
                userData: req.user,
                // role
            })

        } else {
            return res.render('police/safety_tips', {
                userData: req.user
            })
        }
    }

    settingsView(req, res) {

        if (req.user.role === "user") {
            return res.render('user/settings', {
                userData: req.user
            })
        } else if (req.user.role === "admin") {
            return res.render('admin/settings', {
                userData: req.user
            })

        } else {
            return res.render('police/settings', {
                userData: req.user
            })
        }
    }

    async userdashboard(req, res) {
        try {

            const existingUser = await User.findOne({ _id: req.user.id, isVerified: true, status: "Active", isDelete: false });

            // console.log(existingUser);

            if (!existingUser) {
                req.flash("error", "User does not verified!");
                return res.redirect("/abhaya/");
            }

            const allSos = await User.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $lookup: {
                        from: "sos",
                        localField: "_id",
                        foreignField: "userId",
                        as: "sos",
                    },
                },
                {
                    $unwind: "$sos"
                }

            ]);

            const allReports = await User.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $lookup: {
                        from: "reports",
                        localField: "_id",
                        foreignField: "userId",
                        as: "reports",
                    },
                },
                {
                    $unwind: "$reports"
                },

            ]);

            const allContacts = await User.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $lookup: {
                        from: "contacts",
                        localField: "_id",
                        foreignField: "userId",
                        as: "contacts",
                    },
                },
                {
                    $unwind: "$contacts"
                },
            ]);

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const activeSOS = await Sos.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(req.user.id),
                        status: { $ne: "Resolved" },
                        createdAt: {
                            $gte: startOfDay,
                            $lte: endOfDay
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $lookup: {
                        from: 'soscases',
                        localField: '_id',
                        foreignField: 'sosId',
                        as: 'soscase'
                    }
                },
                {
                    $unwind: '$soscase'
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: 1
                }
            ]);


            // console.log(activeSOS);

            return res.render("user/dashboard", {
                userData: req.user,
                allSos,
                allReports,
                allContacts,
                activeSOS,
               
            });

        } catch (error) {

            logger.error(error.message);
            return res.redirect("/auth/login");
        }
    }

    async userStatus(req, res) {
        try {
            const existingUser = await User.findById(req.params.id) || await Police.findById(req.params.id);

            if (!existingUser) {

                logger.warn(error.message);
                return res.redirect("/admin/dashboard");
            }

            // console.log(existingUser);

            if (existingUser.role === 'user' && existingUser.status === "Active") {
                await User.findByIdAndUpdate(req.params.id, { status: "Inactive" }, { new: true });
                return res.redirect("/admin/allusers");

            } else if (existingUser.role === 'user' && existingUser.status === "Inactive") {
                await User.findByIdAndUpdate(req.params.id, { status: "Active" }, { new: true });
                return res.redirect("/admin/allusers");

            } else if (existingUser.role === 'police' && existingUser.status === "Active") {
                await Police.findByIdAndUpdate(req.params.id, { status: "Inactive" }, { new: true });
                return res.redirect("/police/all");

            } else {
                await Police.findByIdAndUpdate(req.params.id, { status: "Active" }, { new: true });
                return res.redirect("/police/all");
            }

            // return res.redirect("/admin/dashboard");

        } catch (error) {

            logger.error(error);
            return res.redirect("/admin/dashboard");
        }
    }

    async userDelete(req, res) {
        try {
            const existingUser = await User.findById(req.params.id) || await Police.findById(req.params.id);

            const role = await Role.findById(existingUser.roleId)

            if (role.roleName === 'user') {

                await User.findByIdAndUpdate(req.params.id, { isDelete: true }, { new: true });
                req.flash("success", "User deleted successfully!");
                return res.redirect("/user/all");

            } else {
                await Police.findByIdAndUpdate(req.params.id, { isDelete: true }, { new: true });
                req.flash("success", "Police deleted successfully!");
                return res.redirect("/police/all");
            }

        } catch (error) {

            logger.error(error.message);
            req.flash("error", "Something went wrong");
            return res.redirect("/admin/dashboard");
        }
    }

    async userRestoreView(req, res) {

        const role = await Role.findOne({roleName: 'user'});

        const allUsers = await User.find({ roleId: role._id, isDelete: true })
        const allPolices = await Police.find({ isDelete: true })

        return res.render('admin/restore', {
            userData: req.user,
            allUsers,
            allPolices
        })
    }

    async userRestore(req, res) {
        try {
            const existingUser = await User.findById(req.params.id) || await Police.findById(req.params.id);
            
            const role = await Role.findById(existingUser.roleId);

            console.log(role);
            
            if (role.roleName === 'user') {
                await User.findByIdAndUpdate(req.params.id, { isDelete: false }, { new: true });
                req.flash("success", "User details retrieved successfully!");
                return res.redirect("/user/all");

            } else {
                await Police.findByIdAndUpdate(req.params.id, { isDelete: false }, { new: true });
                req.flash("success", "Police details retrieved successfully!");
                return res.redirect("/police/all");
            }

        } catch (error) {
            req.flash("error", "Something went wrong");
            return res.redirect("/admin/dashboard")
        }
    }

    async userVerify(req, res) {
        try {
            const existingUser = await User.findById(req.params.id) || await Police.findById(req.params.id);

            if (!existingUser) {

                logger.warn("User does not exist");
                req.flash("error", "User does not exist!");
                return res.redirect("/admin/dashboard");
            }

            // console.log(existingUser);

            const role = await Role.findById(existingUser.roleId);

            if (role.roleName === 'user') {

                await sendEmail(req, existingUser);
                await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
                req.flash("success", "User Verified Successfully!");
                return res.redirect("/user/all");

            } else {
                await Police.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
                req.flash("success", "User Verified Successfully!");
                return res.redirect("/police/all");

            }
        } catch (error) {

            logger.error(error);
            req.flash("error", "Sothing went wrong!");
            return res.redirect("/admin/dashboard");
        }
    }

    async allUsers(req, res) {
        try {

            const allSos = await Sos.find();

            const role = await Role.findOne({ roleName: "user" })

            const allUsers = await User.find({ roleId: role._id, isDelete: false }).sort({ createdAt: -1 });

            if (req.user.role === 'admin') {
                return res.render("admin/users", {
                    userData: req.user,
                    allSos,
                    allUsers,
                })
            } 

        } catch (error) {

            logger.error(error);
            req.flash("error", "Something went wrong");
            res.redirect('/auth/login')
        }
    }
}

module.exports = new UserController()

