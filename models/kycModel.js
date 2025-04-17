const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
        unique: true // One-to-one relationship: one KYC per user
    },
    // Employment Details
    employment: {
        employer: String, // Name of the employer
        salary: Number, // Monthly or annual salary
        lastPayDate: Date // Optional: date of last payment (useful for financial decisions)
    },
    // Bank Details
    bankAccount: {
        accountNumber: { type: String, required: true }, // Bank account number
        bankName: { type: String, required: true }, // Name of the bank
        bvn: String // Optional: Bank Verification Number (used in some countries like Nigeria)
    },
    // Identity Documents
    idPhoto: String, // URL or path to the uploaded government ID image
    selfiePhoto: String, // URL or path to the uploaded selfie photo
    // Timestamps
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

module.exports = mongoose.model("KYC", kycSchema); // Export the KYC model
