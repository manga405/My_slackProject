const mongoose = require("mongoose");

const channelSchema = mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        invited: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        name: {
            type: String,
            require: true
        },
        members: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "users",
        },
        isPublic: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("channels", channelSchema);
