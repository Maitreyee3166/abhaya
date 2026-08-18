const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sosCaseSchema = new Schema({
    sosId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sos",
        required: true
    },

    policeIds: [{
        policeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Police"
        },

        status: {
            type: String,
            enum: ["Accepted", "Pending", "Rejected"],
            default: "Pending"
        }
    }],

    adminId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],

    assignedAt: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        enum: ["Active", "Assigned", "In Progress", "Resolved", "Rejected"],
        default: "Assigned"
    },

    actionTaken: {
        type: String,
        default: null
    },

    notes: {
        type: String,
        default: null
    },

    resolvedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true,
    versionKey: false
});

const SosCaseModel = mongoose.model("soscase", sosCaseSchema);
module.exports = SosCaseModel;