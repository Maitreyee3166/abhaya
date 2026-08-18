const SosCase = require("../models/soscase");
const Sos = require("../models/sos");
const ChatMessage = require("../models/chat");

const { generateAIResponse } = require("../config/aiService");

const mongoose = require('mongoose');

class ChatController {

    async openCaseChat(req, res) {
        try {

            const { caseId } = req.params;

            // console.log("CASE ID:", caseId);

            const sosCases = await SosCase.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(caseId)
                    }
                },
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

                    }
                },
            ]);


            if (!sosCases.length) {
                return res.status(404).send("Case not found");
            }

            const sosCase = sosCases[0];

            // console.log(sosCase._id);
            // console.log(sosCase);
            // console.log(req.user.id);
            // console.log(sosCase.user.fullName);
            // console.log(sosCase.policeIds);
            // console.log(sosCase);

            const userId = req.user.id;
            const role = req.user.role;

            return res.render("chat/case-chat", {
                caseId: sosCase._id,
                sosCase: sosCase,
                userId,
                role,
                victim: sosCase.user.fullName,
                police: sosCase.policeIds

            });

        } catch (error) {

            console.error("OPEN CHAT ERROR:", error);
            return res.redirect('/auth/login')
        }
    };

    async getCaseMessages(req, res) {
        try {

            const { caseId } = req.params;

            // Check whether case exists
            const sosCase = await SosCase.findById(caseId);

            if (!sosCase) {

                req.flash("error", "Case not found.");

                if (req.user.role === 'admin') {
                    return res.redirect("/admin/dashboard");
                } else if (req.user.role === 'police') {
                    return res.redirect("/police/dashboard");
                } else {
                    return res.redirect("/user/dashboard");
                }
            }

            // Get chat messages
            const messages = await ChatMessage.find({
                sosCaseId: caseId
            })
                .sort({ createdAt: 1 })

            const userId = req.user.id;
            const role = req.user.role;

            return res.render("chat/case-chat", {
                caseId: sosCase._id,
                sosCase: sosCase,
                userId,
                role,
                messages: messages
            });

        } catch (error) {

            console.error(
                "Get chat messages error:",
                error
            );

            req.flash(
                "error",
                "Unable to retrieve chat messages."
            );

            if (req.user.role === 'admin') {
                return res.redirect("/admin/dashboard");
            } else if (req.user.role === 'police') {
                return res.redirect("/police/dashboard");
            } else {
                return res.redirect("/user/dashboard");
            }
        }
    }

    async sendCaseMessage({
        caseId,
        senderId,
        senderModel,
        message
    }) {
        try {
            const chatMessage = new ChatMessage({
                sosCaseId: caseId,
                senderId: senderId,
                senderModel: senderModel,
                message: message
            });

            const savedMessage = await chatMessage.save();

            return savedMessage;

        } catch (error) {
            console.error(
                "Send case message controller error:",
                error
            );

            throw error;
        }
    }

    async chatWithAI(req, res) {
        try {
            const { message } = req.body;

            if (!message || !message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Message is required"
                });
            }

            const reply = await generateAIResponse(message);

            return res.status(200).json({
                success: true,
                reply
            });

        } catch (error) {
            console.error("AI Chat Error:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to generate AI response"
            });
        }
    };
};


module.exports = new ChatController()