const ReportIncident = require("../models/report");

class AabhayaController {

    async landingPageView(req, res) {

        try {

            // const allReports = await ReportIncident.find({ status: 'Approved' }).sort({ createdAt: -1 }).limit(3);

            const allReports = await ReportIncident.aggregate([
                {
                    $match: {
                        status: 'Approved'
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
                { $sort: { createdAt: -1 } }
            ])

            // console.log(allReports);

            return res.render("index", { allReports });

        } catch (error) {
            logger.error(error);

        }
    }

    aboutPageView(req, res){
        return res.render('about')
    }

    featuresPageView(req, res){
        return res.render('features')
    }

    safetyTipsPageView(req, res){
        return res.render('safetyTips')
    }
}


module.exports = new AabhayaController()