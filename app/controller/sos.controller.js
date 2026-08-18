const SosModel = require("../models/sos");
const Sos = require("../models/sos");
const SosCase = require("../models/soscase");
const Police = require("../models/police");
const mongoose = require("mongoose");
const logger = require('../utils/logger');

class SosController {

    async sendSOS(req, res) {
        try {
            const { latitude, longitude } = req.body;
            const userId = req.user.id;

            // Validate coordinates
            if (latitude === undefined || longitude === undefined) {
                req.flash("error", "Location not received.");
                return res.redirect("/user/dashboard");
            }

            const sos = new Sos({
                userId,
                location: {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)]
                },
                status: "Active"
            });

            // Save SOS first
            const result = await sos.save();

            // console.log(result);

            // Reverse geocoding
            let locationName = "Unknown location";

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                    {
                        headers: {
                            "User-Agent": "Abhaya/1.0"
                        }
                    }
                );

                if (response.ok) {
                    const locationData = await response.json();

                    locationName =
                        locationData.address?.city ||
                        locationData.address?.town ||
                        locationData.address?.village ||
                        locationData.address?.state ||
                        locationData.display_name ||
                        "Unknown location";

                    // console.log(locationName);

                }
            } catch (locationError) {
                logger.error("Reverse geocoding error:", locationError);
            }

            // Get Socket.io
            const io = req.app.get("io");


            io.emit("sosSent", {
                user: req.user.name,
                userId: result.userId,
                location: locationName,
                status: result.status,
                createdAt: result.createdAt
            });

            req.flash(
                "success",
                "SOS sent successfully. Please stay alert!"
            );

            return res.status(200).json({
                success: true,
                message: "SOS sent successfully. Please stay alert!"
            });

        } catch (error) {
            logger.error("SOS error:", error);

            return res.status(500).json({
                success: false,
                message: "Something went wrong while sending SOS."
            });
        }
    }

    async getMySOS(req, res) {
        try {

            const userId = req.user.id;

            const sosList = await Sos.find({ userId }).sort({ createdAt: -1 });

            for (const element of sosList) {

                const latitude = element.location.coordinates[1];
                const longitude = element.location.coordinates[0];

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                    {
                        headers: {
                            "User-Agent": "Abhaya/1.0"
                        }
                    }
                );

                const locationData = await response.json();

                // Add address temporarily (not saved in DB)
                element.address = locationData.display_name;

            }

            // console.log(activeSOS);

            return res.render("user/sos_history", {
                userData: req.user,
                sosList
            });

        } catch (error) {

            logger.error(error);
            return res.redirect("/user/dashboard");
        }
    }

    async getSOSByDay(req, res) {
        try {

            const userId = req.user.id;

            const { date, status } = req.query;

            let filter = { userId };

            if (date) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 1);

                filter.createdAt = {
                    $gte: startDate,
                    $lt: endDate
                };
            }

            if (status) {
                filter.status = status; // "Active" or "Resolved"
            }

            const sosList = await Sos.find(filter).sort({ createdAt: -1 });


            for (const element of sosList) {

                const latitude = element.location.coordinates[1];
                const longitude = element.location.coordinates[0];

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                    {
                        headers: {
                            "User-Agent": "Abhaya/1.0"
                        }
                    }
                );

                const locationData = await response.json();

                // Add address temporarily (not saved in DB)
                element.address = locationData.display_name;

            }

            return res.render("user/sos_history", {
                userData: req.user,
                sosList,
                date,
                status
            });

        } catch (error) {

            logger.error(error);
            return res.redirect("/user/dashboard");
        }
    }

    async resolveSOS(req, res) {
        try {

            const { id } = req.params;

            await Sos.findByIdAndUpdate(id, {
                $set: {
                    status: "Resolved",
                    resolvedAt: new Date()
                }
            }, { new: true });

            await SosCase.findOneAndUpdate({ sosId: id }, {
                $set: {
                    status: "Resolved",
                    resolvedAt: new Date()
                }
            }, { new: true });

            return res.redirect("/sos/all");

        } catch (error) {

            console.log(error);
            return res.redirect("/sos/all");

        }
    };

    async getAllSOS(req, res) {

        try {
            const sosList = await Sos.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $lookup: {
                        from: 'soscases',
                        localField: '_id',
                        foreignField: 'sosId',
                        as: 'sosCase'
                    }
                },
                {
                    $unwind: {
                        path: '$sosCase',
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $sort: { createdAt: -1 } }
            ]);

            for (const element of sosList) {

                const latitude = element.location.coordinates[1];
                const longitude = element.location.coordinates[0];

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                    {
                        headers: {
                            "User-Agent": "Abhaya/1.0"
                        }
                    }
                );

                const locationData = await response.json();

                // Add address temporarily (not saved in DB)
                element.address = locationData.display_name;

            }

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const activeSOS = await Sos.aggregate([
                {
                    $match: {
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
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: 1
                }
            ]);

            const assignedOfficers = await SosCase.aggregate([
                {
                    $match: {
                        status: { $ne: "Resolved" },
                    }
                },
                {
                    $lookup: {
                        from: 'polices',
                        localField: 'policeId',
                        foreignField: '_id',
                        as: 'polices'
                    }
                },
                {
                    $unwind: '$polices'
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

            const sosCases = await SosCase.aggregate([
                {
                    $match: {
                        status: { $ne: "Resolved" }
                    }
                },

                // Get SOS
                {
                    $lookup: {
                        from: "sos",
                        localField: "sosId",
                        foreignField: "_id",
                        as: "sos"
                    }
                },
                {
                    $unwind: {
                        path: "$sos",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "sos.userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "polices",
                        localField: "policeIds.policeId",
                        foreignField: "_id",
                        as: "assignedOfficers"
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }
            ]);

            // All police officers available for assignment
            const availableOfficers = await Police.find().select("_id fullName email phone stationName city district");

            console.log(sosCases);

            return res.render("admin/sos_alert", {
                userData: req.user,
                sosList,
                activeSOS,
                availableOfficers,
                sosCases,
                assignedOfficers
            });

        } catch (error) {

            logger.error(error);
            return res.redirect("admin/dashboard");
        }

    };

    async acceptSos(req, res) {
        try {

            const policeId = new mongoose.Types.ObjectId(req.user.id);

            logger.info("Police ID:", policeId);
            logger.info("SOS ID:", req.params.id);

            const sosCase = await SosCase.findOne({
                _id: req.params.id,
                "policeIds.policeId": req.user.id
            });

            logger.info(
                "SOS CASE:",
                JSON.stringify(sosCase, null, 2)
            );


            if (!sosCase) {

                logger.warn("SOS Case not found");
                return res.status(404).send("SOS Case not found");
            }


            // Find this police officer inside policeIds
            const officer = sosCase.policeIds.find(
                item =>
                    item.policeId.toString() ===
                    req.user.id.toString()
            );

            logger.info("OFFICER:", officer);

            if (!officer) {
                return res.redirect("/police/dashboard");
            }


            // Change only this officer's status
            officer.status = "Accepted";

            await sosCase.save();

            logger.info(
                "UPDATED:",
                JSON.stringify(sosCase, null, 2)
            );

            return res.redirect("/police/dashboard");

        } catch (error) {

            logger.error(error);
            return res.redirect("/police/dashboard");
        }
    }

    async getPoliceSOS(req, res) {
        try {

            const userId = req.user.id;

            const sosList = await SosCase.aggregate([
                {
                    $match: {
                        "policeIds.policeId": new mongoose.Types.ObjectId(req.user.id),
                    }
                },
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
                { $sort: { createdAt: -1 } }
            ]);

            for (const element of sosList) {

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

                // Add address temporarily (not saved in DB)
                element.address = locationData.display_name;
            }

            // console.log(activeSOS);

            // console.log(sosList);

            return res.render("police/sos_history", {
                userData: req.user,
                sosList
            });

        } catch (error) {

            logger.error(error);
            return res.redirect("/police/dashboard");
        }
    }

    async assignOfficers(req, res) {

        try {

            const { sosId, policeIds } = req.body;

            const Victim = await Sos.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(sosId),

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
                { $unwind: '$user' },
            ]);

            if (!sosId || !policeIds) {
                return res.redirect("/sos/all");
            }

            const selectedPoliceIds =
                Array.isArray(policeIds)
                    ? policeIds
                    : [policeIds];


            if (selectedPoliceIds.length === 0) {
                return res.redirect("/sos/all");
            }

            const sos = await Sos.findById(sosId);

            if (!sos) {
                return res.redirect("/sos/all");
            }

            const officers = await Police.find({
                _id: {
                    $in: selectedPoliceIds
                }
            }).select("_id name email phone");


            if (
                officers.length !==
                selectedPoliceIds.length
            ) {
                return res.redirect("/sos/all");
            }

            let sosCase = await SosCase.findOne({
                sosId: sosId
            });

            if (!sosCase) {

                sosCase = new SosCase({

                    sosId: sosId,

                    adminId: [
                        req.user.id
                    ],

                    policeIds:
                        selectedPoliceIds.map(
                            policeId => ({
                                policeId: policeId,
                                status: "Pending"
                            })
                        ),

                    status: "Active"
                })
            }

            else {

                selectedPoliceIds.forEach(
                    policeId => {

                        const alreadyAssigned =
                            sosCase.policeIds.some(
                                officer =>
                                    officer.policeId
                                        .toString() ===
                                    policeId.toString()
                            );


                        if (!alreadyAssigned) {

                            sosCase.policeIds.push({

                                policeId: policeId,

                                status: "Pending"

                            });
                        }
                    }
                );

                const adminExists =
                    sosCase.adminId.some(
                        id =>
                            id.toString() ===
                            req.user.id.toString()
                    );


                if (!adminExists) {

                    sosCase.adminId.push(
                        req.user.id
                    );

                }
            }

            // console.log(Victim);

            await sosCase.save();

            const io = req.app.get("io");

            selectedPoliceIds.forEach((policeId) => {

                const room = `police_${policeId.toString()}`;

                console.log("Sending to:", room);

                // io.to(room).emit("newSOSAssigned", {

                io.emit("newSOSAssigned", {
                    sosId: sos._id.toString(),
                    sosCaseId: sosCase._id.toString(),
                    victim: Victim[0],
                    location: sos.location,
                    title: "New SOS Assigned",
                    message: "A new emergency SOS case has been assigned to you."
                });

            });

            req.flash("success", "SOS has been assigned to the police successfully!");
            return res.redirect("/sos/all");

        } catch (error) {

            logger.error(error);
            req.flash("error", "Something went wrong");
            return res.redirect("/sos/all");
        }
    }
}


module.exports = new SosController()