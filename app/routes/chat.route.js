const express = require("express");
const router = express.Router();

const AuthCheck = require('../middleware/AuthCheck');
const roleCheck = require('../middleware/roleCheck');

const chatWithAI = require("../controller/chat.controller");


router.post("/api", chatWithAI.chatWithAI);

// Open chat page
router.get(
    "/case/:caseId", AuthCheck,
    chatWithAI.openCaseChat
);


// Get previous messages
router.get(
    "/messages/:caseId", AuthCheck,
    chatWithAI.getCaseMessages
);


module.exports = router;