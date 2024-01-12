const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        _id: {
            type: String,
            trim: true,
            required: true
        },
        password: {
            type: String,
            trim: true,
            required: true
        },
        firstName: {
            type: String,
            trim: true,
            required: true
        },
        lastName: {
            type: String,
            trim: true,
            required: true
        },
        accessToken: {
            type: String
        },
        isOnline: {
            type: Boolean,
            default: false
        },
        nickName: {
            type: String
        },
        picture: {
            type: String
        },
        phone: {
            type: String
        },
        location: {
            type: String
        },
        bio: {
            type: String
        },
        facebookLink: {
            type: String
        },
        twitterLink: {
            type: String
        },
        instagramLink: {
            type: String
        },
        linkedinLink: {
            type: String
        },
        youtubeLink: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

exports.userModel = mongoose.model("User", userSchema)