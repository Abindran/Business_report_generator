const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(username && email && password)) {
      return res.status(400).json({
        error: "Required fields are missing",
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        error: "Username should be at least 3 character",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Provided email is not a valid emailId",
      });
    }

    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /\d/;
    const symbolRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
    const hasUppercase = uppercaseRegex.test(password);
    const hasLowercase = lowercaseRegex.test(password);
    const hasDigit = digitRegex.test(password);
    const hasSymbol = symbolRegex.test(password);

    // Build error messages
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!hasUppercase) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!hasLowercase) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!hasDigit) {
      errors.push("Password must contain at least one digit.");
    }
    if (!hasSymbol) {
      errors.push("Password must contain at least one symbol.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Provided password doesn't met the specification",
        errors,
      });
    }

    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(400).json({
        error: "User email already exists",
      });
    }

    const user = new User(req.body);
    const savedUser = await user.save();

    if (savedUser) {
      return res.status(200).json({
        name: user.name,
        email: user.email,
        id: user._id,
      });
    } else {
      return res.status(400).json({
        error: "NOT ABLE TO SAVE USER IN DB",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({
        error: "Required fields are missing",
      });
    }

    const foundUser = await User.findOne({ email });

    if (foundUser) {
      if (!foundUser.autheticate(password)) {
        return res.status(401).json({
          error: "Email and password do not match",
        });
      }

      //create token
      const token = jwt.sign(
        { _id: foundUser._id, expiresIn: "1h" },
        process.env.SECRET
      );

      // Expires in 12 hours (60 seconds * 60 minutes * 6 hours)
      const expirationTime = new Date(Date.now() + 6 * 60 * 60 * 1000);

      //put token in cookie
      res.cookie("token", token, {
        expire: expirationTime,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      //send response to front end
      const { _id, name, email, role } = foundUser;

      return res.status(200).json({ token, user: { _id, name, email, role } });
    } else {
      return res.status(400).json({
        error: "User email does not exists",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.signout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "User signout successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

//protected routes
exports.isSignedIn = (req, res, next) => {
  // Get the token from the request headers, cookies, or wherever you store it

  let tokenInAuthorization = "";
  if (req.header("Authorization")) {
    tokenInAuthorization = req
      .header("Authorization")
      .replace("Bearer", "")
      .trim();
  }
  let token = tokenInAuthorization || req.cookies.token || "";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Verify the token
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.auth = decoded;
    next();
  });
};

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied",
    });
  }
  next();
};
