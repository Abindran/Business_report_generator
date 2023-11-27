const User = require("../models/user");
const mongoose = require("mongoose");
exports.getUserById = async (req, res, next, id) => {
  try {
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

    if (!isValidObjectId) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }

    const currentUser = await User.findById(id).exec();
    if (currentUser) {
      req.profile = currentUser;
      next();
    } else {
      return res.status(400).json({
        error: "No user was found in DB",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  return res.status(200).json(req.profile);
};

exports.updateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: req.body },
      { new: true, useFindAndModify: false }
    )
      .then((user) => {
        user.salt = undefined;
        user.encry_password = undefined;
        res.status(200).json(user);
      })
      .catch((error) => {
        console.error(error);
        return res.status(400).json({
          error: "You are not authorized to update this user",
        });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
