const Enrollment = require("../models/Enrollment");
const TuitionFee = require("../models/TuitionFee");
const Penalty = require("../models/Penalty");

module.exports.generateTuitionFees = async (req, res) => {
  try {
    const enrollments = await Enrollment.find().lean();

    if (!enrollments.length) {
      return res.status(404).json({ message: "No enrollments found" });
    }

    const createdRecords = [];

    for (const enr of enrollments) {
      // skip if tuition already exists
      const exists = await TuitionFee.findOne({ enrollment_id: enr._id });
      if (exists) continue;

      const newTuition = await TuitionFee.create({
        enrollment_id: enr._id,
        penalty_id: null,          // since penalty is not yet assigned
        total_tuition_fee: enr.total,
        recurring_fee: 0,
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
    const tuitionFees = await TuitionFee.find()
      .populate({
        path: "enrollment_id",
        populate: {
          path: "student_id",
        },
      })
      .populate("penalty_id") // NEW populate penalty
      .sort({ createdAt: -1 })
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


module.exports.attachPenalty = async (req, res) => {
  try {
    const { tuition_id, penalty_id } = req.body;

    // Validate
    if (!tuition_id || !penalty_id) {
      return res.status(400).json({ message: "tuition_id and penalty_id are required" });
    }

    // Check tuition record
    const tuition = await TuitionFee.findById(tuition_id);
    if (!tuition) {
      return res.status(404).json({ message: "Tuition record not found" });
    }

    // Check penalty
    const penalty = await Penalty.findById(penalty_id);
    if (!penalty) {
      return res.status(404).json({ message: "Penalty not found" });
    }

    // Attach penalty
    tuition.penalty_id = penalty_id;

    // OPTIONAL: recalculation (if needed)
    // Example: Add penalty amount to total tuition
    if (penalty.amount) {
      tuition.total_tuition_fee = tuition.total_tuition_fee + penalty.amount;
    }

    await tuition.save();

    // Return updated data with populated fields
    const updated = await TuitionFee.findById(tuition_id)
      .populate({
        path: "enrollment_id",
        populate: { path: "student_id" },
      })
      .populate("penalty_id")
      .lean();

    return res.status(200).json({
      message: "Penalty attached successfully",
      updated,
    });

  } catch (error) {
    console.error("Error attaching penalty:", error);
    return res.status(500).json({
      message: "Failed to attach penalty",
      error: error.message,
    });
  }
};

