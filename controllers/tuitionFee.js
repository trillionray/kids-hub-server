const Enrollment = require("../models/Enrollment");
const TuitionFee = require("../models/TuitionFee");

module.exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      // .populate("student_id") 
      .sort({ last_modified_date: -1 }) // newest first
      .lean();
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrollments", error: error.message });
  }
};


module.exports.generateTuitionFees = async (req, res) => {
  try {
    // Fetch all enrollments
    const enrollments = await Enrollment.find().lean();

    if (!enrollments.length) {
      return res.status(404).json({ message: "No enrollments found" });
    }

    const createdRecords = [];

    for (const enr of enrollments) {


      // Check if tuition already exists for this enrollment
      const exists = await TuitionFee.findOne({ enrollment_id: enr._id });
      if (exists) continue;

      // Create tuition fee document
      const newTuition = await TuitionFee.create({
        enrollment_id: enr._id,
        total_tuition_fee: enr.total,   // using Enrollment.total
        recurring_fee: 0,        // or adjust your formula
        due_date: 0,                 // modify if necessary
        transactions: [],
        total_amount_paid: 0,
      });

      createdRecords.push(newTuition);
    }

    return res.status(201).json({
      message: "Tuition fee records generated",
      created_count: createdRecords.length,
      createdRecords,
    });

  } catch (error) {
    console.error("Error generating tuition fees:", error);
    return res.status(500).json({
      message: "Failed to generate tuition fees",
      error: error.message,
    });
  }
};

module.exports.getTuitionFees = async (req, res) => {
  try {
    // Fetch all tuition fees
    const tuitionFees = await TuitionFee.find()
      .populate({
        path: "enrollment_id",
        // enrollment fields you want
        populate: {
          path: "student_id",       // populate the student document
   		// fields from student you need
        },
      })
      .sort({ createdAt: -1 }) // newest first
      .lean();

    return res.status(200).json(tuitionFees);

  } catch (error) {
    console.error("Error fetching tuition fees:", error);
    return res.status(500).json({
      message: "Failed to fetch tuition fees",
      error: error.message,
    });
  }
};

