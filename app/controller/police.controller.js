const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Sos = require('../models/sos');
const SosCase = require('../models/soscase');
const Report = require('../models/report');
const Role = require('../models/role');
const Contact = require('../models/contact');
const Police = require("../models/police");
const sendEmail = require('../utils/sendEmail');
const { default: mongoose } = require('mongoose');
const logger = require('../utils/logger');

class PoliceController {

    async policeDashboard(req, res) {

        try {

            const allSos = await Sos.find().sort({ createdAt: -1 });

            const allReports = await Report.find().sort({ createdAt: -1 });

            // const allUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 });

            const role = await Role.findOne({roleName: "user"})
                        
            const allUsers = await User.find({ roleId: role._id, isDelete: false }).sort({ createdAt: -1 });

            const activeSOS = await SosCase.aggregate([
                {
                    $match: {
                        "policeIds.policeId": new mongoose.Types.ObjectId(req.user.id),
                        status: "Active"

                    }
                },
                {
                    $lookup: {
                        from: 'polices',
                        localField: 'policeIds.policeId',
                        foreignField: '_id',
                        as: 'police'
                    }
                },

                { $unwind: '$police' },
                {
                    $lookup: {
                        from: 'sos',
                        localField: 'sosId',
                        foreignField: '_id',
                        as: 'sos'
                    }
                },

                { $unwind: '$sos' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'sos.userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },

                { $unwind: '$user' },
                { $sort: { createdAt: -1 } },
            ]);

            // console.log(activeSOS);

            for (const element of activeSOS) {

                const latitude = element.sos.location.coordinates[1];
                const longitude = element.sos.location.coordinates[0];

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                    {
                        headers: {
                            "User-Agent": "Abhaya/1.0"
                        }
                    }
                );

                const locationData = await response.json();

                element.address = locationData.display_name;
            }

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            return res.render("police/dashboard", {
                userData: req.user,
                activeSOS,
                allSos,
                allReports,
                allUsers,

            });
        } catch (error) {

            logger.error(error.message);
            res.redirect('/auth/login')
        }
    }

    async allPolice(req, res) {
        try {

            const allPolices = await Police.find({ isDelete: false });

            return res.render("admin/police", {
                userData: req.user,
                allPolices

            });

        } catch (error) {

            logger.error(error);
            req.flash("error", "Something went wrong");
            res.redirect('/admin/dashboard')
        }

    }

    policeCreateView(req, res) {
        return res.render("admin/police_add", {
            userData: req.user
        });
    }

    async addPolice(req, res) {
        try {

            const { stationName, fullName, badgeNumber, email, password, phone, gender, state, district, city } = req.body;

            const existingPolice = await Police.findOne({ stationName, fullName });

            if (existingPolice) {

                req.flash("error", "User already exist");
                return res.redirect('/admin/dashboard');
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
            
            const specialChars = "@#$!%&*";

            const uppercase =
                String.fromCharCode(65 + Math.floor(Math.random() * 26));

            const characters =
                Math.random().toString(36).substring(2, 5);

            const numbers =
                Math.floor(Math.random() * 10).toString() +
                Math.floor(Math.random() * 10).toString() +
                Math.floor(Math.random() * 10).toString();

            const special =
                specialChars[Math.floor(Math.random() * specialChars.length)];

            const finalPassword =
                characters + numbers + uppercase + special;

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(finalPassword, salt);

            // console.log("Generated password:", randomPassword);

            const policeRole = await Role.findOne({ roleName: "police" });

            const police = new Police({
                stationName,
                fullName,
                badgeNumber,
                email,
                password: hashPassword,
                phone,
                state,
                gender,
                roleId: policeRole._id,
                district,
                city,
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            });


            if (req.file) {

                police.image = req.file.path;
                police.cloudinaryId = req.file.filename;
            }

            const newPolice = await police.save();

            await sendEmail(req, newPolice, finalPassword);

            // console.log("New police added:", newPolice);

            if (newPolice) {

                logger.info('User created successfully')
                req.flash(
                    "success",
                    "Police officer added successfully."
                );
                return res.redirect('/police/all');
            }

        } catch (error) {
            logger.error(error);
            req.flash("error", "Something went wrong");
            res.redirect('/police/create');
        }
    }
}


module.exports = new PoliceController();