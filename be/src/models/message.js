const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        reciever: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "channels",
            required: true,
        },
        receivers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "users",
        },
        message: {
            type: String,
        },
        files: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "files",
        },
        emoticons: [
            {
                creator: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "users",
                },
                code: {
                    type: String
                }
            }
        ],
        isPined: {
            type: Boolean,
            default: false
        },
        isdraft: {
            type: Boolean,
            default: false
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "messages",
            default: null
        },
        mentions: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'users'
            }
        ],
        childCount: Number,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("messages", messageSchema);
