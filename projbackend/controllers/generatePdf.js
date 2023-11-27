exports.getPdfGenerateInput = (req, res) => {
  if (!(req.body.businessName && req.body.businessDescription)) {
    return res.status(400).json({
      error: "Required fields are missing",
    });
  }

  res.json(req.body);
};
