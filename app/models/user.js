const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["female", "male", "other"],
      required: true,
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    },
    // role: {
    //   type: String,
    //   enum: ["user", "parent", "police", "admin"],
    //   required: true,
    //   default: "user",
    // },

    password: {
      type: String,
      required: true,
      minlength: 8,
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
},{
    timestamps: true,
    versionKey: false
});

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel
