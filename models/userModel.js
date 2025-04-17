const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, // User's full name, required field
    email: { type: String, unique: true, required: true }, // User's email, must be unique and required
    phone: { type: String, required: true }, // User's phone number, required field
    password: { type: String, required: true }, // User's password, required field
    role: { type: String, enum: ["user", "admin"], default: "user" }, // User's role, defaults to 'user' if not specified
    kycStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"], // KYC status of the user, can be 'pending', 'approved', or 'rejected'
        default: "pending" // Defaults to 'pending'
    },
    blacklisted: { type: Boolean, default: false } // Whether the user is blacklisted, defaults to false
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields to each document

module.exports = mongoose.model("User", userSchema); // Export the User model based on the schema
