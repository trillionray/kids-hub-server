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

module.exports.addTransaction = async (req,res)=> {
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
          updated_by,
          hasPenalty, 
          daysLate, 
          totalPenaltyAmount  // ⬅ must come from frontend for monthly
      } = req.body;

      const filePath = req.file ? `/uploads/receipts/${req.file.filename}` : "";
      let payment_status="", final_amount=amount, excess_amount=0;

      /** =============================
       *   📌 If Downpayment — compare
       * ============================= */
      if(transaction_type==="Downpayment"){
          const data = await getOverallDetails(enrollment_id);
          if(!data.success) return res.status(400).json(data);

          const dp = await getRemainingDownPayment(enrollment_id, data.program._id);

          if(amount < dp.remaining) payment_status="underpaid";
          else if(amount == dp.remaining) payment_status="complete";
          else{
              payment_status="overpaid";
              final_amount = dp.remaining;
              excess_amount = amount - dp.remaining;
          }
      }

      /* ==========================================================
      *                     🔷 MONTHLY PAYMENT LOGIC
      * ========================================================== */
      if (transaction_type === "Monthly") {

          const tuitionDetails = await getOverallDetails(enrollment_id);
          if (!tuitionDetails.success) return res.status(400).json(tuitionDetails);

          const monthly = await getMonthlyPenaltyStatus(
              enrollment_id,
              null,
              tuitionDetails.tuitionfee?.recurring_fee
          );

          const remainingTuition = Number(tuitionDetails.tuitionfee.total_tuition_fee) 
                                - Number(tuitionDetails.tuitionfee.total_amount_paid);

          // 🔸 AVAILABLE FUNDS = PAYMENT + PREVIOUS EXCESS
          const totalAvailable = Number(amount) + Number(monthly.excess_amount ?? 0);

          // 🔥 Prevent exceeding remaining tuition
          if (totalAvailable > remainingTuition) {
              return res.status(400).json({
                  success: false,
                  message: `❗ Payment exceeds remaining balance. Max allowed: ₱${remainingTuition.toFixed(2)}`
              });
          }

          const totalPayable = monthly.totalPayable;

          // UNDERPAY
          if (totalAvailable < totalPayable) {
              payment_status = "underpaid";
          }

          // EXACT PAYMENT
          else if (totalAvailable === totalPayable) {
              payment_status = "complete";
          }

          // EXCESS AVAILABLE → carry to next
          else if (totalAvailable > totalPayable) {
              payment_status = "excess";
              excess_amount = totalAvailable - totalPayable;
              final_amount   = totalPayable;
          }
      }

      /** =============================
       *   💾 SAVE MAIN TRANSACTION
       * ============================= */
      const mainTransaction = await Transaction.create({
          enrollment_id, 
          transaction_type,
          amount: 
          final_amount,
          mode_payment, 
          reference_no, 
          receipt_date,
          comment, 
          picture_file_path:filePath,
          payment_status, 
          is_due:false,
          created_by, updated_by,

          // ✨ Save penalty info only when monthly
          totalPenaltyAmount: transaction_type==="Monthly" ? totalPenaltyAmount||0 : 0,
          daysLate: transaction_type==="Monthly" ? daysLate||0 : 0,
          hasPenalty: transaction_type==="Monthly" ? hasPenalty||false : false
      });

      /** =============================
       *   🔥 UPDATE TUITION FEE RECORD
       * ============================= */
      const tuition = await TuitionFee.findOne({ enrollment_id });
      if(tuition){

          // add amount paid
          tuition.total_amount_paid = Number(tuition.total_amount_paid) + Number(final_amount);

          // add penalty only if exists
          if(transaction_type==="Monthly" && hasPenalty && totalPenaltyAmount > 0){
            tuition.total_penalty_fee = Number(tuition.total_penalty_fee) + Number(totalPenaltyAmount);
          }

          // add transaction reference
          tuition.transactions.push(mainTransaction._id);

          await tuition.save();
      }

      /** =============================
       *  🟡 CREATE EXCESS PAYMENT RECORD
       * ============================= */
      if(excess_amount>0){
          const excessTrans = await Transaction.create({
              enrollment_id, transaction_type:"ExcessPayment",
              amount:excess_amount, mode_payment, reference_no,
              receipt_date, comment, picture_file_path:filePath,
              payment_status:"excesspayment", is_due:false,
              created_by, updated_by
          });

          tuition.total_amount_paid = Number(tuition.total_amount_paid) + Number(excess_amount);
          tuition.transactions.push(excessTrans._id);
          await tuition.save();
      }

      return res.status(201).json({
          success:true,
          message: excess_amount>0
                   ? "Downpayment accepted with excess recorded"
                   : "Transaction added successfully",
          transaction:mainTransaction
      });

  } catch(err){
      console.error("Add Transaction Failed:",err);
      res.status(500).json({ success:false, message:"Server Error", details:err.message })
  }
};


module.exports.checkMonthlyDetails = async (req, res) => {
   try {
        const{ enrollment_id} = req.body;
        if (!enrollment_id)
            return res.status(400).json({ error: "Missing required fields." });

        const data = await getOverallDetails(enrollment_id);
        console.log(data.tuitionfee?.recurring_fee)
        const monthlydata = await getMonthlyPenaltyStatus(enrollment_id, "2024-9-17", data.tuitionfee?.recurring_fee);
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

      if (!tuition) return { success:false,message:"Tuition fee not found" };
      if (!tuition.penalty_id) return { success:true,hasPenalty:false,message:"No penalty assigned" };

      const penalty = tuition.penalty_id;
      const enrollment = tuition.enrollment_id;

      const start = new Date(enrollment.academic_year_id.startDate);
      const today = mockDate ? new Date(mockDate) : new Date();


      // ==========================
      //     GET PAYMENT HISTORY
      // ==========================
      const paymentRecords = await Transaction.find({
          enrollment_id,
          transaction_type: "Monthly"
      }).sort({ created_at: 1 });


      // COUNT **FULLY PAID ONLY**
      const paidMonths = paymentRecords.filter(p =>
          ["complete", "overpaid"].includes(p.payment_status)
      ).length;

      // COUNT **UNDERPAID MONTHS**
      const underPaidCount = paymentRecords.filter(p => p.payment_status === "underpaid").length;


      // ==============================
      //  FIRST DUE MONTH = START + 1
      // ==============================
      const firstDueMonth = new Date(start);
      firstDueMonth.setMonth(start.getMonth() + 1); // first month ignored


      // ==============================
      //  MONTH DUE = unpaid or underpaid
      // ==============================
      const totalMonthsElapsed =
        (today.getFullYear() - start.getFullYear()) * 12 +
        (today.getMonth() - start.getMonth()) - 1;  // minus first month

      const dueMonths = Math.max(totalMonthsElapsed - paidMonths, 0);


      // ==============================
      //  CURRENT DUE MONTH DATE
      // ==============================
      const unpaidMonth = new Date(firstDueMonth);
      unpaidMonth.setMonth(firstDueMonth.getMonth() + paidMonths);


      // ==============================
      //  DUE DATE for CURRENT MONTH
      // ==============================
      const firstDueDate = new Date(
          unpaidMonth.getFullYear(),
          unpaidMonth.getMonth(),
          penalty.due_date
      );


      // ============================
      //  DAYS LATE (if past due date)
      // ============================
      const daysLate = today > firstDueDate
          ? Math.floor((today - firstDueDate) / (1000 * 60 * 60 * 24))
          : 0;

      // ============================
      //  LAST EXCESS PAYMENT (overpaid or excesspayment)
      // ============================
      const lastExcess = await Transaction.findOne({
          enrollment_id,
          $or: [
              { transaction_type: "Monthly" },
              { payment_status: "overpaid" },
              { excess_amount: { $gt: 0 } }
          ]
      }).sort({ created_at: -1 }); // get most recent transaction
      const excess_amount = lastExcess?.excess_amount || 0;

      // ==============================
      //  TOTAL PENALTY FORMULA
      // ==============================
      const totalPenalty = daysLate * penalty.penalty_amount * dueMonths;
      const monthlyFeeToPay = recurr_fee * dueMonths;
      const totalPayable = monthlyFeeToPay + totalPenalty;


      return {
        success: true,
        hasPenalty: dueMonths > 0 && daysLate > 0,
        // BILLING
        dueMonths,
        recurr_fee,
        monthlyFeeToPay,      //
        totalPenalty,
        // FINAL PAYABLE
        totalPayable,         //
        // ADDITIONAL INFO
        daysLate,
        penaltyPerDay: penalty.penalty_amount,
        underPaidCount,
        nextBillingStart: firstDueMonth,
        // EXCESS AMOUNT
        excess_amount 
      };

  } catch (err) {
      return { success:false,message:err.message };
  }
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