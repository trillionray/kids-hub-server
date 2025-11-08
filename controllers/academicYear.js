const AcademicYear = require('../models/AcademicYear');

  // Create a new academic year
  module.exports.createAcademicYear = async (req, res) => {
    try {

      const latestAcademicYear = await AcademicYear.findOne().sort({ creationDate: -1 });

      const { startDate, endDate } = req.body;

      if (latestAcademicYear && (new Date(startDate) <= latestAcademicYear.endDate || new Date(endDate) <= latestAcademicYear.endDate)) {
        return res.status(400).send({message:"New academic year must start after the latest academic year ends"});
      }


      const newAcademicYear = new AcademicYear({
        startDate,
        endDate,
        createdBy: req.user.id,
        updatedBy: req.user.id // initially the same
      });

      const savedAcademicYear = await newAcademicYear.save();
      res.status(201).json(savedAcademicYear);
    } catch (error) {
      console.error('Error creating academic year:', error);
      res.status(500).json(error);
    }
  };


module.exports.getAcademicYears = async (req, res) => {
  try {
    const today = new Date();

    const academicYears = await AcademicYear.find().sort({ startDate: -1 });

    // Move the "current" academic year to the top
    const sorted = academicYears.sort((a, b) => {
      const isCurrentA = today >= a.startDate && today <= a.endDate;
      const isCurrentB = today >= b.startDate && today <= b.endDate;
      if (isCurrentA && !isCurrentB) return -1;
      if (!isCurrentA && isCurrentB) return 1;
      return b.startDate - a.startDate; // fallback sort
    });

    res.status(200).json(sorted);
  } catch (error) {
    console.error("Error fetching academic years:", error);
    res.status(500).json({ message: "Server error while fetching academic years." });
  }
};


// Update academic year by ID
module.exports.updateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    const updatedAcademicYear = await AcademicYear.findByIdAndUpdate(
      id,
      {
        startDate,
        endDate,
        lastModifiedDate: Date.now(),
        updatedBy: req.user.id
      },
      { new: true }
    );

    if (!updatedAcademicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }

    res.status(200).json(updatedAcademicYear);
  } catch (error) {
    console.error('Error updating academic year:', error);
    res.status(500).json({ message: 'Server error while updating academic year.' });
  }
};

// DELETE an academic year by ID
module.exports.deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AcademicYear.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    res.status(200).json({ message: 'Academic year deleted successfully.' });
  } catch (error) {
    console.error('Error deleting academic year:', error);
    res.status(500).json({ message: 'Server error while deleting academic year.' });
  }
};


module.exports.getLatestAcademicYear = async (req, res) => {
  try {
    const latest = await AcademicYear.findOne().sort({ startDate: -1 });
    res.status(200).json(latest);
  } catch (err) {
    console.error("getLatestAcademicYear error:", err);
    res.status(500).json({ message: "Failed to get latest academic year" });
  }
};