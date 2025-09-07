const mongoose = require('mongoose');

const miscellaneousPackageSchema = new mongoose.Schema({
  package_name: { type: String, required: true, unique: true },
  package_description: { type: String },
  package_price: { type: Number, required: true },
  is_active: { type: Boolean, required: true },
  miscs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Miscellaneous' }],
  miscs_total: {type: Number},
  created_by: { type: String, required: true },
  last_updated_by: { type: String, required: true }
}, {
  timestamps: {
    createdAt: 'creation_date',
    updatedAt: 'last_updated'
  }
});

module.exports = mongoose.model('MiscellaneousPackage', miscellaneousPackageSchema);
