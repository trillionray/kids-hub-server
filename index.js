const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require('dotenv').config();

const adminRoutes = require("./routes/admin");
const academicYearRoutes = require("./routes/academicYear");
const enrollmentRoutes = require("./routes/enrollment");

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
app.use("/admin", adminRoutes);
app.use("/enroll", enrollmentRoutes);


app.listen(process.env.PORT || 4000, () => {
    console.log(`API is now online on port ${ process.env.PORT || 4000 }`)
});

