const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    
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

    suffix: {
        type: String
    },

    username: {
        type: String,
        required: [true, 'Username is Required']
    },
    password: {
        type: String,
        required: [true, 'Password is Required']
    }, // <-- this comma was missing
    role: {
        type: String,
        enum: ['admin', 'teacher', 'cashier'],
        required: [true, 'Role is Required']
    }
});

module.exports = mongoose.model('Admin', adminSchema);
