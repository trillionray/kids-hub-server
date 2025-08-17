const mongoose = require('mongoose');

const miscellaneousSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    is_active: { type: Boolean, required: true },
    created_by: { type: String, required: true },
    last_updated_by: { type: String, required: true }
}, {
    timestamps: {
        createdAt: 'creation_date',
        updatedAt: 'last_updated'
    }
});



module.exports = mongoose.model('Miscellaneous', miscellaneousSchema);