require('dotenv').config(); // Load env variables
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  const result = await User.updateMany({}, { $set: { isActive: true } });
  console.log(`Matched ${result.matchedCount}, Modified ${result.modifiedCount} users`);

  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
});