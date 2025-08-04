const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    email: {
        type: String
    },
    username: {
        type: String,
        required: [true, 'Username is Required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is Required']
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'cashier'],
        required: [true, 'Role is Required']
    }
});

module.exports = mongoose.model('User', userSchema);
