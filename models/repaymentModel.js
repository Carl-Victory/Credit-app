const mongoose = require("mongoose");

const repaymentSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan",
        required: true
    },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ["pending", "paid", "late", "defaulted"],
        default: "pending"
    },
    penalty: { type: Number, default: 0 }, // New field to track penalties
    lateFee: { type: Number, default: 0 },
    paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Repayment", repaymentSchema);