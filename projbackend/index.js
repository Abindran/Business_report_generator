require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();

//DB Connection
mongoose.connect(process.env.DATABASE).then(() => {
  console.log("DB CONNECTED");
});

//Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//My routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const pdfRoutes = require("./routes/pdf");
const generatePdfRoutes = require("./routes/generatePdf");

//Router Middleware integeration
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", pdfRoutes);
app.use("/api", generatePdfRoutes);

//PORT
const port = process.env.PORT || 8000;

//Starting a server
app.listen(port, () => {
  console.log(`server is running at ${port}`);
});
