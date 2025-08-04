const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    
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

    gender: {
        type: String
    },

    birthdate: {
        type: String
    },

    address: {
        street: {
            type: String
        },
        barangay: {
            type: String
        },
        city: {
            type: String
        },
        province: {
            type: String
        }
    },

    contact: {
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
        relationship: {
            type: String
        }
    }
});

module.exports = mongoose.model('Student', studentSchema);
