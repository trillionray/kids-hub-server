const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  _id: { type: String }, // custom string ID

  firstName: {
    type: String,
    required: [true, 'First Name is Required'],
  },
  middleName: { type: String },
  lastName: {
    type: String,
    required: [true, 'Last Name is Required'],
  },
  suffix: { type: String },

  gender: { type: String },
  birthdate: { type: String },

  address: {
    street: { type: String },
    barangay: { type: String },
    city: { type: String },
    province: { type: String },
  },

  // ✅ Contacts are stored inside the same Student document
  contacts: [
    {
      firstName: { type: String },
      middleName: { type: String },
      lastName: { type: String },
      suffix: { type: String },
      relationship: { type: String },
      contact_number: { type: String },
    },
  ],
});

// optional: enforce max 3 contacts
studentSchema.path('contacts').validate(function (value) {
  return value.length <= 3;
}, 'A student can have at most 3 contacts');

module.exports = mongoose.model('Student', studentSchema);
