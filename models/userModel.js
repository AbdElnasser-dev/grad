const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      maxLength: 25,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      maxLength: 25,
      trim: true,
      unique:true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://p.kindpng.com/picc/s/78-785904_block-chamber-of-commerce-avatar-white-avatar-icon.png"
    },
    role: { type: String, default: "user" },
    gender: { type: String, default: "male" },
    mobile: { type: String, default: "" },
    address: { type: String, default: "" },
    story: { type: String, default: "", maxLength: 200 },
    website: { type: String, default: "" },
    website: { type: String, default: "" },
    follewers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    follewing: [{ type: mongoose.Types.ObjectId, ref: "user" }],
  },
  {
    timestamp: true,
  }
);
module.exports = mongoose.model("user", UserSchema);
