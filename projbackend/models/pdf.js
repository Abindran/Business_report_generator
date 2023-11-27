const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
let pdfSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    pdf_data: {
      type: {
        public_id: {
          type: String,
          required: true,
        },
        secure_url: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pdf", pdfSchema);
