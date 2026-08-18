const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Sos = require('../models/sos');
const Report = require('../models/report');
const Contact = require('../models/contact');
const Police = require("../models/police");
const logger = require('../utils/logger');
const Role = require("../models/role");


class AdminController {

    async admindashboard(req, res) {
        try {

            const allSos = await Sos.find().sort({ createdAt: -1 });

            const allReports = await Report.find().sort({ createdAt: -1 });

            const role = await Role.findOne({roleName: "user"})
            
            const allUsers = await User.find({ roleId: role._id, isDelete: false }).sort({ createdAt: -1 });

            const allPolices = await Police.find({isDelete: false}).sort({ createdAt: -1 });

            // console.log(allPolices);
            // console.log(allUsers);

            return res.render("admin/dashboard", {
                userData: req.user,
                allSos,
                allReports,
                allUsers,
                allPolices

            });

        } catch (error) {

            logger.error(error);
            res.redirect('/auth/login')
        }
    }
}


module.exports = new AdminController();