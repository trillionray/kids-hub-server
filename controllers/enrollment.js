const Enrollment = require("../models/Enrollment");
const { errorHandler } = require("../auth");

module.exports.enroll = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      suffix,
      gender,
      birthdate,
      address,
      contact
    } = req.body;

    const newEnrollment = new Enrollment({
      firstName,
      middleName,
      lastName,
      suffix,
      gender,
      birthdate,
      address,
      contact
    });

    const result = await newEnrollment.save();

    return res.status(201).send({
      message: 'Enrolled successfully',
      enrollment: result
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find();

    return res.status(200).send({
      message: "All students retrieved successfully",
      enrollments
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error"
    });
  }
};