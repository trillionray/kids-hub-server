const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  _id: { type: String }, // custom string ID

  first_name: {
    type: String,
    required: [true, 'First Name is Required'],
  },
  middle_name: { type: String },
  last_name: {
    type: String,
    required: [true, 'Last Name is Required'],
  },
  suffix: { type: String },

  gender: { type: String },
  birthdate: { type: String },

  address: {
    block_or_lot: { type: String },
    street: { type: String },
    barangay: { type: String },
    municipality_or_city: { type: String },
  },

  mother: {
    first_name: { type: String },
    middle_name: { type: String },
    last_name: { type: String },
    suffix: { type: String },
    occupation: { type: String },
    address: {
      block_or_lot: { type: String },
      street: { type: String },
      barangay: { type: String },
      municipality_or_city: { type: String },
    },
    contacts: {
      mobile_number: { type: String },
      messenger_account: { type: String },
    },
  },

  father: {
    first_name: { type: String },
    middle_name: { type: String },
    last_name: { type: String },
    suffix: { type: String },
    occupation: { type: String },
    address: {
      block_or_lot: { type: String },
      street: { type: String },
      barangay: { type: String },
      municipality_or_city: { type: String },
    },
    contacts: {
      mobile_number: { type: String },
      messenger_account: { type: String },
    },
  },

  emergency: {
    first_name: { type: String },
    middle_name: { type: String },
    last_name: { type: String },
    suffix: { type: String },
    occupation: { type: String },
    address: {
      block_or_lot: { type: String },
      street: { type: String },
      barangay: { type: String },
      municipality_or_city: { type: String },
    },
    contacts: {
      mobile_number: { type: String },
      messenger_account: { type: String },
    },
  },
});

module.exports = mongoose.model('Student', studentSchema);
