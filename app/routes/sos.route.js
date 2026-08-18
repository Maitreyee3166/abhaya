const express = require("express");
const router = express.Router();

const roleCheck = require('../middleware/roleCheck');
const AuthCheck = require('../middleware/AuthCheck');

const sosController = require("../controller/sos.controller");

// Send SOS

router.post("/send", AuthCheck, roleCheck('user'), sosController.sendSOS);

// User SOS History

router.get("/history", AuthCheck, roleCheck('user'), sosController.getMySOS);


router.get("/day", AuthCheck, roleCheck('user'), sosController.getSOSByDay);

// Resolve SOS

router.get("/resolve/:id", AuthCheck, roleCheck('admin'), sosController.resolveSOS);

// Accept sos

router.get("/accept/:id", AuthCheck, roleCheck('admin', 'police'), sosController.acceptSos);

// Admin

router.get("/all", AuthCheck, roleCheck('admin'), sosController.getAllSOS);

// Police

router.get("/case-history", AuthCheck, roleCheck('police'), sosController.getPoliceSOS);

router.post("/assign-officers", AuthCheck, roleCheck('admin'), sosController.assignOfficers);


module.exports = router;