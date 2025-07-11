const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require('dotenv').config();

const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

mongoose.connect(process.env.MONGODB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

app.use("/admin", adminRoutes);
app.use("/students", studentRoutes);


app.listen(process.env.PORT || 4000, () => {
    console.log(`API is now online on port ${ process.env.PORT || 4000 }`)
});

