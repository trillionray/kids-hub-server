
const Program = require("../models/Program");
const Transaction = require("../models/Transactions").default;
const Enrollment = require("../models/Enrollment"); 
const TuitionFee = require("../models/TuitionFee");
const Penalty = require("../models/Penalty"); 
const mongoose = require("mongoose");

// Correct relative path to the validation helper
module.exports.getTransaction = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Transaction route is working!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.checkDownPaymentDetails = async (req, res) => {
   try {
        const { enrollment_id, program_id } = req.body;
        if (!enrollment_id || !program_id)
            return res.status(400).json({ error: "Missing required fields." });

        const data = await getRemainingDownPayment(enrollment_id, program_id);

        return res.status(200).json({
            success: true,
            ...data
        });
    } catch (err) {
        console.error("Downpayment check failed:", err);
        return res.status(500).json({ error: "Server error.", details: err.message });
    }
};

module.exports.addTransaction = async (req, res) => {
  try {
    const {
      enrollment_id,
      transaction_type,
      amount,
      mode_payment,
      reference_no,
      receipt_date,
      comment,
      created_by,
      updated_by
    } = req.body;

    const filePath = req.file ? `/uploads/receipts/${req.file.filename}` : "";

    let payment_status = "";
    let final_amount = Number(amount);
    let excess_amount = 0;

    let hasPenalty = false;
    let daysLate = 0;
    let totalPenaltyAmount = 0;

    let total_required_amount = 0;
    let is_due = false;
    let amount_due = 0;

    /* =============================
     * DOWNPAYMENT
     * ============================= */
    if (transaction_type === "Downpayment") {
      const data = await getOverallDetails(enrollment_id);
      if (!data.success) return res.status(400).json(data);

      const dp = await getRemainingDownPayment(enrollment_id, data.program._id);

      total_required_amount = dp.remaining;

      if (final_amount < dp.remaining) {
        payment_status = "underpaid";
      } else if (final_amount === dp.remaining) {
        payment_status = "complete";
      } else {
        payment_status = "overpaid";
        excess_amount = final_amount - dp.remaining;
        final_amount = dp.remaining;
      }

      // ❗ Downpayment has NO penalty
      is_due = false;
      amount_due = 0;
    }

    /* =============================
     * MONTHLY
     * ============================= */
    if (transaction_type === "Monthly") {
      const tuitionDetails = await getOverallDetails(enrollment_id);
      if (!tuitionDetails.success) return res.status(400).json(tuitionDetails);

      const monthly = await getMonthlyPenaltyStatus(
        enrollment_id,
        null,//"2024-10-19" THIS IS FOR TESTING
        tuitionDetails.tuitionfee.recurring_fee
      );

      if (monthly.finalPayable <= 0) {
        return res.status(400).json({
          success: false,
          message: "No outstanding monthly balance."
        });
      }

      const payable = Number(monthly.finalPayable);
      const paid = Number(amount);

      total_required_amount = payable;
      console.log("total_required_amount: " + total_required_amount)
      console.log("paid: " + paid)
      hasPenalty = monthly.hasPenalty;
      daysLate = monthly.daysLate;
      totalPenaltyAmount = monthly.totalPenalty;

      // ✅ PENALTY RULE (AUTHORITATIVE)
      if (hasPenalty && totalPenaltyAmount > 0) {
        is_due = true;
        amount_due = totalPenaltyAmount;
      }

      if (paid < payable) {
        payment_status = "underpaid";
        final_amount = paid;
      } else if (paid === payable) {
        payment_status = "complete";
        final_amount = payable;
      } else {
        payment_status = "overpaid";
        final_amount = payable;
        excess_amount = paid - payable;
      }
    }

    /* =============================
     * SAVE TRANSACTION
     * ============================= */
    const mainTransaction = await Transaction.create({
      enrollment_id,
      transaction_type,
      amount: final_amount,
      total_required_amount,
      amount_due,
      is_due,
      mode_payment,
      reference_no,
      receipt_date,
      comment,
      picture_file_path: filePath,
      payment_status,
      excess_amount,
      created_by,
      updated_by,

      hasPenalty,
      daysLate,
      totalPenaltyAmount
    });

    /* =============================
     * UPDATE TUITION
     * ============================= */
    const tuition = await TuitionFee.findOne({ enrollment_id });
    if (tuition) {
      tuition.total_amount_paid += final_amount;

      if (transaction_type === "Monthly" && hasPenalty) {
        tuition.total_penalty_fee += totalPenaltyAmount;
      }

      tuition.transactions.push(mainTransaction._id);
      await tuition.save();
    }

    return res.status(201).json({
      success: true,
      message: excess_amount > 0
        ? "Payment recorded with excess carried forward"
        : "Transaction added successfully",
      transaction: mainTransaction
    });

  } catch (err) {
    console.error("Add Transaction Failed:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      details: err.message
    });
  }
};



module.exports.checkMonthlyDetails = async (req, res) => {
   try {
        const{ enrollment_id} = req.body;
        if (!enrollment_id)
            return res.status(400).json({ error: "Missing required fields." });

        const data = await getOverallDetails(enrollment_id);
        console.log(data.tuitionfee?.recurring_fee)
        const monthlydata = await getMonthlyPenaltyStatus(enrollment_id, null, data.tuitionfee?.recurring_fee); //change the null "2024-10-19" to test
        //const data = await getMonthlyPenaltyStatus(enrollment_id);
        
        return res.status(200).json({
            success: true,
            ...monthlydata
        });
    } catch (err) {
        console.error("Monthly payment check failed:", err);
        return res.status(500).json({ error: "Server error.", details: err.message });
    }
};

//Functions for checking payment
const getOverallDetails = async (enrollment_id) => { //Get details for Enrollment, Program, TuitionFee, Penalty
  try {
    // Get Tuition Fee + Enrollment + Penalty
    const tuitionfee = await TuitionFee.findOne({ enrollment_id })
      .populate("enrollment_id")       // gets full enrollment info
      .populate("penalty_id");         // gets full penalty info

    if (!tuitionfee) {
      return { success: false, message: "Tuition fee not found for this enrollment" };
    }

    const program_id = tuitionfee.enrollment_id?.program_id;
    if (!program_id) {
      return { success: false, message: "Program not found in enrollment record" };
    }

    const program = await Program.findById(program_id);
    if (!program) {
      return { success: false, message: "Program details not found" };
    }

    return {
      success: true,
      tuitionfee,  // contains penalty details and enrollment inside
      program      // full program information
    };

  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getRemainingDownPayment = async (enrollment_id, program_id) => { //Getting the DOWNPAYMENT DETAILS
  const enrollment = await Enrollment.findById(enrollment_id);
  if (!enrollment) throw new Error("Enrollment not found");
  const program = await Program.findById(program_id);
  if (!program) throw new Error("Program not found");

  const requiredDownPayment = parseFloat(program.down_payment.toFixed(2));

  const result = await Transaction.aggregate([
    {
      $match: {
        enrollment_id: new mongoose.Types.ObjectId(enrollment_id),
        transaction_type: "Downpayment"
      }
    },
    {
      $group: {
        _id: null,
        total_paid: { $sum: "$amount" }
      }
    }
  ]);

  const totalPaid = result.length > 0 ? parseFloat(result[0].total_paid.toFixed(2)) : 0;
  const remaining = parseFloat((requiredDownPayment - totalPaid).toFixed(2));
  return { requiredDownPayment, totalPaid, remaining };
};

const getMonthlyPenaltyStatus = async (enrollment_id, mockDate = null, recurr_fee) => {
  try {
      const tuition = await TuitionFee.findOne({ enrollment_id })
        .populate("penalty_id")
        .populate({
            path: "enrollment_id",
            populate: { path: "academic_year_id" }
        });

      if (!tuition) return { success:false, message:"Tuition fee not found" };
      if (!tuition.penalty_id) return { success:true, hasPenalty:false, message:"No penalty assigned" };

      const penalty = tuition.penalty_id;
      const enrollment = tuition.enrollment_id;

      const start = new Date(enrollment.academic_year_id.startDate);
      const today = mockDate ? new Date(mockDate) : new Date();

      // ======================================
      // GET ALL MONTHLY PAYMENT HISTORY
      // ======================================
      const paymentRecords = await Transaction.find({
          enrollment_id,
          transaction_type: "Monthly"
      }).sort({ created_at: 1 });

      const paidMonths = new Set();

      paymentRecords.forEach(txn => {
        const txnDate = new Date(txn.receipt_date);
        const key = `${txnDate.getFullYear()}-${txnDate.getMonth()}`;

        if (Number(txn.amount) >= recurr_fee) {
          paidMonths.add(key);
        }
      });


      // ======================================
      // LAST PAYMENT RECORD
      // ======================================
      const lastMonthlyTxn = paymentRecords.length > 0 ? paymentRecords[paymentRecords.length - 1] : null;

      let isCurrentMonthPaid = false;
      let monthly_insufficient_balance = 0;
      let due_amount_paid = 0;

      if (lastMonthlyTxn) {
          const currentMonthPayment = paymentRecords.find(txn => {
            const txnDate = new Date(txn.receipt_date);
            return txnDate.getFullYear() === today.getFullYear() &&
                  txnDate.getMonth() === today.getMonth() &&
                  Number(txn.amount) >= recurr_fee; // 🔥 KEY
          });

          isCurrentMonthPaid = !!currentMonthPayment;



          if (lastMonthlyTxn.payment_status === "underpaid") {
              const paidAmount = Number(lastMonthlyTxn.amount);
              if (paidAmount < recurr_fee) {
                  monthly_insufficient_balance = recurr_fee - paidAmount;
              } else if (paidAmount > recurr_fee) {
                  due_amount_paid = paidAmount - recurr_fee;
              }
          }
      }

      // ======================================
      // FIRST MONTHLY DUE = START + 1 MONTH
      // ======================================
      const firstDueMonth = new Date(start);
      firstDueMonth.setMonth(start.getMonth() + 1);
      firstDueMonth.setDate(penalty.due_date);

      // ======================================
      // TOTAL EXCESS FROM ALL PAYMENTS
      // ======================================
      const allExcess = await Transaction.aggregate([
        {
          $match: {
            enrollment_id: new mongoose.Types.ObjectId(enrollment_id),
            excess_amount: { $gt: 0 }
          }
        },
        { $group: { _id: null, totalExcess: { $sum: "$excess_amount" } } }
      ]);
      let remainingExcess = allExcess.length > 0 ? allExcess[0].totalExcess : 0;

      // ======================================
      // MONTHLY FEE CALCULATION
      // ======================================
      let monthsDue = 0;
      let pointer = new Date(firstDueMonth);
      const monthDiff = (today.getFullYear() - pointer.getFullYear()) * 12 + (today.getMonth() - pointer.getMonth());

      let unpaidMonths = 0;
      let temp = new Date(firstDueMonth);

      while (temp <= today) {
        const key = `${temp.getFullYear()}-${temp.getMonth()}`;
        if (!paidMonths.has(key)) {
          unpaidMonths++;
        }
        temp.setMonth(temp.getMonth() + 1);
      }

      const monthlyFeeToPay = unpaidMonths * recurr_fee;


      // ======================================
      // ADJUST FOR UNDERPAID LAST PAYMENT
      // ======================================
      let adjustedMonthlyFeeToPay = monthlyFeeToPay;
      let adjustedPenalty = 0;

      const daysLate = Math.max(Math.floor((today - new Date(pointer.getFullYear(), pointer.getMonth(), penalty.due_date)) / (1000 * 60 * 60 * 24)), 0);
      adjustedPenalty = daysLate * penalty.penalty_amount;

      if (lastMonthlyTxn && lastMonthlyTxn.payment_status === "underpaid") {
          const paidAmount = Number(lastMonthlyTxn.amount);

          if (paidAmount < recurr_fee) {
              monthly_insufficient_balance = recurr_fee - paidAmount;
              //adjustedMonthlyFeeToPay += monthly_insufficient_balance;
          } else if (paidAmount > recurr_fee) {
              due_amount_paid = paidAmount - recurr_fee;
              adjustedPenalty = Math.max(adjustedPenalty - due_amount_paid, 0);
          }
      }

      // ======================================
      // APPLY EXCESS
      // ======================================
      const totalPayable = adjustedMonthlyFeeToPay + adjustedPenalty;
      let finalPayable = Math.max(totalPayable - remainingExcess, 0);
      const isFullyPaid = finalPayable === 0;
      const remainingPenalty = adjustedPenalty;

      // ======================================
      // MONTHLY COVERAGE INFO
      // ======================================
      let coveredMonths = Math.floor(remainingExcess / recurr_fee);
      const firstUncoveredMonth = new Date(pointer);
      firstUncoveredMonth.setMonth(firstUncoveredMonth.getMonth() + coveredMonths);

      return {
          success: true,
          hasPenalty: daysLate > 0,
          isCurrentMonthPaid,

          recurr_fee,
          dueMonths: monthsDue,
          monthlyFeeToPay,
          totalPenalty: adjustedPenalty,
          totalPayable,
          daysLate,
          penaltyPerDay: penalty.penalty_amount,

          monthly_insufficient_balance,
          due_amount_paid,

          remainingPenalty,
          finalPayable,
          isFullyPaid,

          coveredMonths,
          remainingExcess,
          penaltyStartDate: pointer,
          firstUncoveredMonth,
          nextBillingStart: firstDueMonth
      };

  } catch (err) {
      return { success:false, message: err.message };
  }
};



const isPaidCurrentMonth = async (enrollment_id, currentDate) => {
    const targetDate = currentDate ? new Date(currentDate) : new Date();

    const startOfMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        1
    );

    const endOfMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth() + 1,
        0,
        23, 59, 59, 999
    );

    const isPaid = await Transaction.findOne({
        enrollment_id,
        transaction_type: "Monthly",
        receipt_date: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    });

    // ✅ RETURN BOOLEAN
    return !!isPaid;
};








  //{ //EXAMPLE OUTPUTT FOR GET OVERALLDETAILS FUNCTION
    // {
    //   "success": true,
    //   "tuitionfee": {
    //     "_id": "67b1d512900af1fc2cf3a883",
    //     "enrollment_id": {
    //       "_id": "67b1d4f3900af1fc2cf3a770",
    //       "student_id": "ST-001",
    //       "program_id": "67b1d3e2900af1fc2cf3a622",
    //       "total": 15000,
    //       "status": "active"
    //     },
    //     "total_tuition_fee": 15000,
    //     "recurring_fee": 2000,
    //     "total_amount_paid": 5000,
    //     "penalty_id": {
    //       "_id": "67b1d699900af1fc2cf3b110",
    //       "amount": 250,
    //       "description": "Late fee per month",
    //       "effective_after_days": 10
    //     }
    //   },
    //   "program": {
    //     "_id": "67b1d3e2900af1fc2cf3a622",
    //     "name": "Advanced English Program",
    //     "category": "long",
    //     "rate": 15000,
    //     "down_payment": 3000,
    //     "recurring_fee": 2000
    //   }
    // }

  //}

// //return bool
// const isItOverDueThisMonth = sync () => {
//  //return true or false kung lagpas na sya this month 
// }

// //get the month that is overdue
// const getOverDueMonths = sync () => {
//   //return the  
// }


// 1) penalty will add per day 
// 
//THINGS TO CONSIDER
//advance payment
//pag nag bayad ako 
//need ko makuha is yung start month ng school year up to current month 
//if current month 
//ichecheck ko if current month ba is yung second month ng start month is yes then no penalty included pero if may remaining add sa need bayaran 
// pero pag ang current month is not equal to 



// Transaction table
// Enrollment_id
// transaction_type
// amount
// mode_payment
// reference_no (optional)
// receipt_date
// comment
// picture_file_path/url
// is_due [true(1) or false(0)] 
// payment_status [complete, overpaid, underpaid, excesspayment] 
// created_by
// created_at
// updated_at
// updated_by

// TUITION FEE TABLE
// id
// enrollment_id
// due_date
// Total_tuition_fee
// recurring_fee
// total_amount_paid

// PENALTY TABLE
// id
// SchoolYearID
// ProgramType
// FullDueDate
// FullPenalty
// Active

// 690f4fdf571e2dd1b99cbb5a


// TO DO
// add validation in enrollment
// - do not allow student to enroll if unpaid last school year


// Status
// Incomplete - Pag di bayad natapos na school year
// Complete - bayad lahat
// Ongoing - kapag enroll na yung bata nakapag start na payment 
// Pending - kapag wala pa downpayment 

//npm install multer
// Validation for enrollment to add 
// 1st - Enrollment module pag sinelect yung old student upon clicking ng studyante 