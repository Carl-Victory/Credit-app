// Import required models and services
const Loan = require("../models/loanModel");
const Repayment = require("../models/repaymentModel");
const { disburseLoan, chargeUser } = require("../services/payment");
const { sendSMS, sendWhatsApp } = require("../services/notification");
const stripe = require("stripe")(process.env.STRIPE_TEST_KEY); // Initialize Stripe with test key
require("dotenv").config(); // Load environment variables

// =======================
// Apply for a Loan
// =======================
async function applyForLoan(req, res, next) {
    const { amount, tenureDays } = req.body;
    const userId = req.user._id; // Extract user ID from authenticated request (JWT)

    try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + tenureDays); // Set due date based on tenure

        // Calculate total repayment using compound interest formula
        const dailyRate = 0.0004; // Interest rate: 0.04% per day
        const totalRepayment = amount * Math.pow(1 + dailyRate, tenureDays);

        // Create a new loan instance
        const loan = new Loan({
            userId,
            amount,
            totalRepayment: totalRepayment.toFixed(2), // Format to 2 decimal places
            dueDate,
            interestRate: dailyRate * 100, // Store interest rate as percentage
        });

        await loan.save(); // Save loan to DB

        res.status(201).json({ success: true, loan }); // Respond with created loan
    } catch (error) {
        next(error); // Pass errors to centralized error handler
    }
}

// =======================
// Approve or Reject a Loan
// =======================
async function approveLoan(req, res, next) {
    const { loanId } = req.params;
    const { action } = req.body; // Expected values: "approve" or "reject"

    try {
        const loan = await Loan.findById(loanId).populate("userId");
        if (!loan) throw new Error("Loan not found");

        if (action === "approve") {
            // Approve the loan
            loan.status = "approved";
            await loan.save();

            // Simulate disbursement (for test mode only)
            const disbursement = await disburseLoan(
                loan.amount,
                "ba_1Oe8Wt2eZvKYlo2C0q7BwYlX" // NOTE: Replace hardcoded account in production
            );

            // Optionally notify user via SMS (commented out)
            /*
            await sendSMS(
                loan.userId.phone,
                `Your loan of $${loan.amount} has been approved!`
            );
            */

            res.status(200).json({
                success: true,
                message: "Loan approved and funds disbursed.",
                loan,
                disbursement,
            });
        } else if (action === "reject") {
            // Reject the loan
            loan.status = "rejected";
            await loan.save();

            // Notify user of rejection
            await sendSMS(
                loan.userId.phone,
                `Your loan application for $${loan.amount} has been rejected.`
            );

            res.status(200).json({
                success: true,
                message: "Loan rejected.",
                loan,
            });
        } else {
            throw new Error("Invalid action. Use 'approve' or 'reject'.");
        }
    } catch (error) {
        next(error); // Pass errors to centralized error handler
    }
}

// =======================
// Manual Loan Repayment
// =======================
const repayLoan = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const userId = req.user._id;

        // Find an active (approved) loan for the user
        const loan = await Loan.findOne({ userId, status: 'approved' });
        if (!loan) {
            throw new Error('No active loan found for this user');
        }

        // Prevent overpayment
        if (loan.repaidAmount + amount > loan.totalRepayment) {
            return res.status(400).json({
                success: false,
                message: `You are attempting to overpay. The remaining balance is $${loan.totalRepayment - loan.repaidAmount}.`,
            });
        }

        // Check if already fully repaid
        if (loan.repaidAmount = loan.totalRepayment) {
            return res.status(400).json({
                success: false,
                message: 'This loan has already been fully repaid.',
            });
        }

        // Optionally, charge the user using payment method
        // const result = await chargeUser(paymentMethod, amount);

        // Update loan repayment amount
        loan.repaidAmount = (loan.repaidAmount || 0) + amount;

        // If fully repaid, mark loan as repaid
        if (loan.repaidAmount >= loan.totalRepayment) {
            loan.status = 'repaid';
        }

        await loan.save(); // Save loan changes

        res.status(200).json({
            success: true,
            message: 'Loan repayment successful',
            loan,
            // result,
        });
    } catch (error) {
        next(error); // Forward error to error handler
    }
};

// =======================
// Get Repayment History for a Loan
// =======================
const getRepaymentHistory = async (req, res, next) => {
    try {
        const { loanId } = req.params;

        // Fetch all repayments for the given loan
        const repayments = await Repayment.find({ loanId }).sort({ dueDate: 1 });

        if (repayments.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No repayments have been made.",
                repayments: [],
            });
        }

        res.status(200).json({
            success: true,
            repayments,
        });
    } catch (error) {
        next(error);
    }
};

// =======================
// Automatically Update Repayment Statuses (e.g. mark as "late")
// =======================
const updateRepaymentStatus = async () => {
    try {
        const overdueRepayments = await Repayment.find({
            status: "pending",
            dueDate: { $lt: new Date() }, // Past due
        }).populate("loanId"); // Populate associated loan data

        for (const repayment of overdueRepayments) {
            repayment.status = "late";

            // Apply penalty fee (flat amount)
            const penaltyAmount = 10;
            repayment.penalty += penaltyAmount;

            // Notify the user
            const loan = repayment.loanId;
            const userId = loan.userId;
            const user = await User.findById(userId);

            if (user) {
                await sendSMS(
                    user.phone,
                    `Your repayment of $${repayment.amountDue} is overdue. A penalty of $${penaltyAmount} has been added.`
                );
            }

            await repayment.save(); // Save repayment updates

            // Update total repayment amount in the loan
            loan.totalRepayment += penaltyAmount;
            await loan.save();
        }

        console.log("Repayment statuses updated successfully.");
    } catch (error) {
        console.error("Error updating repayment statuses:", error.message);
    }
};

// =======================
// Get Loan Details Including Penalties
// =======================
async function getLoanDetails(req, res, next) {
    try {
        const { loanId } = req.params;
        const loan = await Loan.findById(loanId);

        if (!loan) {
            throw new Error("Loan not found");
        }

        // Calculate total penalties from repayment records
        const repayments = await Repayment.find({ loanId });
        const totalPenalty = repayments.reduce((sum, repayment) => sum + repayment.penalty, 0);

        res.status(200).json({
            success: true,
            loan: {
                amount: loan.amount,
                interestRate: loan.interestRate,
                totalRepayment: loan.totalRepayment,
                dueDate: loan.dueDate,
                status: loan.status,
                totalPenalty,
                repayments,
                penaltyApplied: loan.penaltyApplied || false,
            },
        });
    } catch (error) {
        next(error);
    }
}

// Export all controller functions
module.exports = {
    applyForLoan,
    approveLoan,
    repayLoan,
    getLoanDetails,
    getRepaymentHistory,
    updateRepaymentStatus,
};
