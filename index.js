const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require('dotenv').config();

const userRoutes = require("./routes/user");
const academicYearRoutes = require("./routes/academicYear");
const studentRoutes = require("./routes/student");
const miscellaneousRoutes = require("./routes/miscellaneous");
const miscellaneousPackageRoutes = require("./routes/miscellaneousPackage");
const programRoutes = require("./routes/program");
const enrollmentRoutes = require("./routes/enrollment");
const classRoutes = require("./routes/class");
const summaryRoutes = require("./routes/summary");
const attendanceRoutes = require("./routes/attendance");
const branchRoutes = require("./routes/branch");
const transactionRoutes = require("./routes/transaction"); 

const tuitionFeeRoutes = require("./routes/tuitionFee"); 
const discountRoutes = require("./routes/discount");

const penaltyRoutes = require("./routes/penalty"); 
const logRoutes = require("./routes/log")


const app = express();

app.use(express.json());

let corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
}
app.use(cors());

mongoose.connect(process.env.MONGODB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

app.use("/academic-year", academicYearRoutes);
app.use("/academic-years", academicYearRoutes);
app.use("/users", userRoutes);
app.use("/students", studentRoutes);
app.use("/miscellaneous", miscellaneousRoutes);
app.use("/miscellaneous-package", miscellaneousPackageRoutes);
app.use("/programs", programRoutes);
app.use("/enrollments", enrollmentRoutes);
app.use("/class", classRoutes);
app.use("/classes", classRoutes);
app.use("/summary", summaryRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/branches", branchRoutes);

app.use("/transaction", transactionRoutes); 
app.use("/penalty", penaltyRoutes);
app.use("/penalties", penaltyRoutes);

app.use("/tuition-fees", tuitionFeeRoutes); 
app.use("/discounts", discountRoutes); 
app.use("/uploads", express.static("uploads"));
app.use("/logs", logRoutes);

app.listen(process.env.PORT || 4000, () => {
    console.log(`API is now online on port ${ process.env.PORT || 4000 }`)
});

