const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const policeSchema = new Schema(
  {
    stationName: {
      type: String,
      required: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    badgeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["female", "male", "other"],
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    cloudinaryId: {
      type: String,
      // required: true
    },

    district: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    },

    // role: {
    //   type: String,
    //   enum: ["user", "parent", "police", "admin"],
    //   default: "police"
    // },

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

    refreshToken: {
      type: String,
      default: ""
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

policeSchema.index({ location: "2dsphere" });


const policeModel = mongoose.model("Police", policeSchema);
module.exports = policeModel;
