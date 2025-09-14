const mongoose = require('mongoose');

// employee
// EN202500001

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'First Name is Required']
  },
  middleName: {
    type: String,
    required: [true, 'Middle Name is Required']
  },
  lastName: {
    type: String,
    required: [true, 'Last Name is Required']
  },
  suffix: String,
  email: String,
  password: {
    type: String,
    required: [true, 'Password is Required']
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'cashier'],
    required: [true, 'Role is Required']
  },
  status: {
    type: String,
    default: "initial"
  },
  isActive: {
    type: Boolean,
    default: true // or false if you want new users inactive by default
  }
});


module.exports = mongoose.model('User', userSchema);
