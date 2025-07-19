const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYear');
const { verify, verifyAdmin} = require("../auth");

// POST /api/academic-years
router.post('/', verify, academicYearController.createAcademicYear);
router.get('/', verify, academicYearController.getAcademicYears);
router.patch('/:id', verify, academicYearController.updateAcademicYear);
router.delete('/:id', verify, academicYearController.deleteAcademicYear);

module.exports = router;
