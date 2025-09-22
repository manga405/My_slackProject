const mongoose = require("mongoose");

const file = mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "channels",
    },
    originalname: {
      type: String,
      require: true
    },
    filename: {
      type: String,
      require: true
    },
    destination: {
      type: String,
      require: true
    },
    mimetype: {
      type: String,
      require: true
    },
    path: {
      type: String,
      require: true
    }

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("files", file);
