const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new mongoose.Schema(
    {
        sosCaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SosCase",
            required: true,
            index: true
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        senderModel: {
            type: String,
            enum: ["user", "admin", "police"],
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ChatModel = mongoose.model("Chat", chatSchema);

module.exports = ChatModel
