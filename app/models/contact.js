const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    contacts: [
        {
            name: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            relationship: {
                type: String,
                enum: ["Family", "Friend"],
                required: true
            },
        }
    ]
    
    // state: {
    //     type: String,
    //     required: true
    // },
    // district: {
    //     type: String,
    //     required: true
    // },
    // city: {
    //     type: String,
    //     required: true
    // },

}, {
    timestamps: true,
    versionKey: false
});


const contactModel = mongoose.model("Contact", contactSchema);
module.exports = contactModel;