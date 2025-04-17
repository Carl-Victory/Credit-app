const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model (who took the loan)
        required: true // User must be linked to a loan
    },
    amount: {
        type: Number,
        required: true // The principal loan amount
    },
    totalRepayment: {
        type: Number,
        required: true // The total amount to be repaid, including interest
    },
    interestRate: {
        type: Number,
        required: true, // Interest rate applied to the loan (e.g., daily rate of 0.04%)
    },
    dueDate: {
        type: Date,
        required: true, // The due date for the loan repayment
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "disbursed", "repaid", "defaulted"], // Various states a loan can be in
        default: "pending" // Default status is "pending" before approval
    },
    repaymentMethod: {
        type: String,
        enum: ["auto-debit", "manual"], // Method of repayment: auto-debit or manual
        default: "manual" // Default is manual repayment
    },
    repaidAmount: {
        type: Number,
        default: 0 // Amount that has been repaid so far
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model("Loan", loanSchema); // Export the Loan model
