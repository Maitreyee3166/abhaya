const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sosSchema = new Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },

  status: {
    type: String,
    enum: ["Active", "In Progress", "Resolved", "Rejected"],
    default: "Active",
  },

  resolvedAt: {
    type: Date,
    default: null,
  }

}, {
  timestamps: true,
  versionKey: false
});


const SosModel = mongoose.model("sos", sosSchema);
module.exports = SosModel;