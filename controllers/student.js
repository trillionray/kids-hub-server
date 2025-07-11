const Student = require("../models/Student");
const { errorHandler } = require("../auth");

module.exports.registerStudent = async (req, res) => {
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

    const newStudent = new Student({
      firstName,
      middleName,
      lastName,
      suffix,
      gender,
      birthdate,
      address,
      contact
    });

    const result = await newStudent.save();

    return res.status(201).send({
      message: 'Student registered successfully',
      student: result
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();

    return res.status(200).send({
      message: "All students retrieved successfully",
      students
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error"
    });
  }
};