const express = require("express");
const router = express.Router();

const roleCheck = require('../middleware/roleCheck');
const AuthCheck = require('../middleware/AuthCheck');
const validateWeb = require('../middleware/apiValidate');

const {reportSchemaValidation, incidentTypeValidation} = require('../validation/reportValidation');

const reportIncidentController = require("../controller/reportIncident.controller");
const evidenceImage = require('../utils/cloudinary');



// report type

router.get("/type-create-view", AuthCheck, roleCheck('admin'), reportIncidentController.incidentTypeCreateView);
router.post("/type-create", AuthCheck, roleCheck('admin'), validateWeb(incidentTypeValidation, "/report/type-create-view"), reportIncidentController.incidentTypeCreate);

// report

router.get("/view", AuthCheck, roleCheck('user'), reportIncidentController.reportIncidentView);

// create report

router.get("/create-view", AuthCheck, roleCheck('user'), reportIncidentController.reportIncidentCreateView);
router.post("/create", AuthCheck, roleCheck('user'), validateWeb(reportSchemaValidation, "/report/create-view"), evidenceImage.single('evidence'), reportIncidentController.reportCreate);


// all

router.get("/all", AuthCheck, roleCheck('admin', 'police'), reportIncidentController.allReport);
router.get("/review/:id", AuthCheck, roleCheck('admin'), reportIncidentController.reportReview);
router.get("/approve/:id", AuthCheck, roleCheck('admin'), reportIncidentController.reportApproved);
router.get("/reject/:id", AuthCheck, roleCheck('admin'), reportIncidentController.reportRejected);


module.exports = router;