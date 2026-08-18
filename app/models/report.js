const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    incidentTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "incidenttype",
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    time: {
        type: String,
        required: true
    },

    location: {
        type: String,
        // required: true
    },

    latitude: Number,
    
    longitude: Number,

    description: {
        type: String,
        required: true
    },

    evidence: {
        type: String
    },

    cloudinaryId: {
        type: String
    },

    severity: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },

    anonymous: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ["Pending", "Reviewed", "Approved", "Rejected"],
        default: "Pending"
    }

}, {
    timestamps: true,
    versionKey: false
});


const reportModel = mongoose.model("report", reportSchema);
module.exports = reportModel;