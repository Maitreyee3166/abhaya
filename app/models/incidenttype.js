const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const incidentSchema = new Schema({
    incidenttypeName: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      // required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);


const IncidentModel = mongoose.model("incidenttype", incidentSchema);
module.exports = IncidentModel;
