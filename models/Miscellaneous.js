const mongoose = require('mongoose');

const miscellaneousSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  school_year_id: {                
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  price: { 
    type: Number, 
    required: true 
  },
  is_active: { 
    type: Boolean, 
    required: true 
  },
  created_by: { 
    type: String, 
    required: true 
  },
  last_updated_by: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: {
    createdAt: 'creation_date',
    updatedAt: 'last_updated'
  }
});

// ✅ Only this compound unique index
miscellaneousSchema.index({ name: 1, school_year_id: 1 }, { unique: true });

module.exports = mongoose.model('Miscellaneous', miscellaneousSchema);