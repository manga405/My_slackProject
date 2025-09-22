const mongoose = require("mongoose");

const DM = mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    invited: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      require: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DM", DM);
