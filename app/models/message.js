const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    type:  {
      type: String,
      required: true,
    },

    message:  {
      type: String,
      required: true,
    },
  
}, {
    timestamps: true,
    versionKey: false
});

const MessageModel = mongoose.model("Message", MessageSchema);
module.exports = MessageModel