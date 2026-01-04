const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: String, // or ObjectId if referencing a User collection
    required: true,
  },
  task: {
    type: String, // e.g., "Created document", "Edited document"
    required: true,
  },
  documentLog: {
    type: Object, // store the object/document that was created, edited, or deleted
    default: null,
  },
  datetime: {
    type: Date,
    default: Date.now, // automatically set to current time
  },
}, { timestamps: true }); // adds createdAt and updatedAt

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
