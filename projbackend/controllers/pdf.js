const cloudinary = require("cloudinary").v2;
const Pdf = require("../models/pdf");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getPdfData = async (req, res) => {
  try {
    if (!(req.body.title && req.files)) {
      return res.status(400).json({
        error: "Required fields are missing",
      });
    }

    const result = await cloudinary.uploader
      .upload(req.files.pdf_file.tempFilePath, {
        folder: "business_report_generator",
      })
      .catch((error) => {
        console.error(error);
        return res.status(422).json({
          error: "Unable to upload the pdf file into cloud",
        });
      });

    const { public_id, secure_url } = result;
    const { title, description } = req.body;
    const { _id } = req.profile;

    const modelPayload = {
      title,
      description,
      user: _id,
      pdf_data: {
        public_id,
        secure_url,
      },
    };

    const pdf_doc = new Pdf(modelPayload);
    const savedPdfData = await pdf_doc.save();

    if (savedPdfData) {
      res.status(200).json({
        msg: "Pdf is uploaded and Pdf data saved in DB successfully ",
        id: savedPdfData._id,
      });
    } else {
      return res.status(400).json({
        error: "NOT ABLE TO SAVE PDF DATA IN DB",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
