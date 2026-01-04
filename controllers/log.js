const Log = require('../models/Log'); // adjust path if needed

// Add a new log entry
const addLog = async (req, res) => {
  try {
    const { user, task, documentLog } = req.body;

    // Create a new log
    const newLog = new Log({
      user,
      task,
      documentLog: documentLog || null, // optional
    });

    const savedLog = await newLog.save();

    res.status(201).json({
      message: 'Log added successfully',
      log: savedLog,
    });
  } catch (error) {
    console.error('Error adding log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addLog };
