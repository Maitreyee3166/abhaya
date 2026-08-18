const SosModel = require("../models/sos");
const ReportIncident = require("../models/report");
const IncidentType = require("../models/incidenttype");

const cloudinary = require("../config/cloudinary");
const { default: mongoose } = require("mongoose");

const logger = require('../utils/logger')

class reportIncidentController {

    async incidentTypeCreateView(req, res) {

        const existingType = await IncidentType.find({ isDeleted: false });

        return res.render("admin/incident_type_create", {
            userData: req.user,
            existingType
        });
    }

    async incidentTypeCreate(req, res) {
        try {
            const { incidenttypeName, description } = req.body;

            // console.log(req.body);

            if (!incidenttypeName) {

                return res.redirect("/report/type-create-view");
            };

            const existingType = await IncidentType.findOne({ incidenttypeName });

            if (existingType) {

                return res.redirect("/report/type-create-view");
            };

            const newType = new IncidentType({ incidenttypeName, description });

            // console.log(newType);

            const result = await newType.save();

            return res.redirect("/report/type-create-view");

        } catch (error) {
            logger.error(error);
            return res.redirect("/report/all");
        }
    }

    async reportIncidentView(req, res) {
        try {

            const userId = req.user.id;

            // const reportList = await ReportIncident.find({ userId }).sort({ date: -1 });

            const reportList = await ReportIncident.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(req.user.id),
                    }
                },
                {
                    $lookup: {
                        from: 'incidenttypes',
                        localField: 'incidentTypeId',
                        foreignField: '_id',
                        as: 'incidentType'
                    }
                },
                { $unwind: '$incidentType' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                { $sort: { date: -1 } }
            ])

            // console.log(reportList);

            return res.render("user/report_incident", {
                userData: req.user,
                reportList
            });

        } catch (error) {
            logger.error(error);
            return res.render("user/report_incident");
        }

    }

    async reportIncidentCreateView(req, res) {

        const incidentTypes = await IncidentType.find({ isDeleted: false });

        return res.render("user/report_incident_create", {
            userData: req.user,
            incidentTypes
        });
    }

    async reportCreate(req, res) {
        try {

            const {
                incidentTypeId,
                date,
                time,
                location,
                latitude,
                longitude,
                description,
                evidence,
                severity,
                anonymous } = req.body;

            if (!incidentTypeId || !date || !time || !description || !severity) {
                return res.redirect('/report/view');
            }

            // console.log("before", req.body);

            const existingReport = await ReportIncident.findOne({ userId: req.user.id, incidentTypeId, location });

            // console.log("existingReport", existingReport);

            if (existingReport) {
                return res.redirect('/report/view');
            }

            // const latitude = req.body.latitude

            // console.log(req.body);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${req.body.latitude}&lon=${req.body.longitude}`,
                {
                    headers: {
                        "User-Agent": "Abhaya/1.0"
                    }
                }
            );

            const locationData = await response.json();

            // Add address temporarily (not saved in DB)

            const reportLocation = locationData.display_name;

            const report = new ReportIncident({
                userId: req.user.id,
                incidentTypeId,
                date,
                time,
                location: reportLocation,
                latitude,
                longitude,
                description,
                evidence,
                severity,
                anonymous
            });

            if (req.file) {
                report.evidence = req.file.path;
                report.cloudinaryId = req.file.filename;
            }

            // console.log(report);

            const result = await report.save()

            return res.redirect('/report/view')

        } catch (error) {
            
            logger.error(error);
            return res.redirect('/report/view')
        }
    };

    async allReport(req, res) {
        try {

            const allReports = await ReportIncident.aggregate([
                {
                    $lookup: {
                        from: 'incidenttypes',
                        localField: 'incidentTypeId',
                        foreignField: '_id',
                        as: 'incidentType'
                    }
                },
                { $unwind: '$incidentType' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                { $sort: { createdAt: -1 } }
            ])

            if (req.user.role === "admin") {
                return res.render("admin/report_incident", {
                    userData: req.user,
                    reportList: allReports
                });
            } else if (req.user.role === "police") {
                return res.render("police/report_incident", {
                    userData: req.user,
                    reportList: allReports
                })
            }

        } catch (error) {
            logger.error(error.message);
            return res.redirect('/report/view')
        }
    };

    async reportReview(req, res) {
        try {

            const reportId = req.params.id;

            const report = await ReportIncident.findById(reportId);

            if (!report) {

                logger.warn("Report not found");
                return res.redirect('/report/all');
            }

            await ReportIncident.findByIdAndUpdate(reportId, { status: "Reviewed" }, { new: true });

            return res.redirect('/report/all');

        } catch (error) {

            logger.error(error.message);
            return res.redirect('/report/all')
        }
    };

    async reportApproved(req, res) {
        try {

            const reportId = req.params.id;

            const report = await ReportIncident.findById(reportId);

            if (!report) {

                logger.warn("Report not found");
                return res.redirect('/report/all');
            }

            await ReportIncident.findByIdAndUpdate(reportId, { status: "Approved" }, { new: true });

            return res.redirect('/report/all');

        } catch (error) {
           
            logger.error(error.message);
            return res.redirect('/report/all')
        }
    };

    async reportRejected(req, res) {
        try {

            const reportId = req.params.id;

            const report = await ReportIncident.findById(reportId);

            if (!report) {

                logger.warn("Report not found");
                return res.redirect('/report/all');
            }

            await ReportIncident.findByIdAndUpdate(reportId, { status: "Rejected" }, { new: true });

            return res.redirect('/report/all');

        } catch (error) {

            logger.error(error.message);
            return res.redirect('/report/all')
        }
    };
}


module.exports = new reportIncidentController()