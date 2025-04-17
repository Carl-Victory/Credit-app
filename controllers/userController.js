// Import user model, notification service, authentication utilities, environment variables, and loan model
const User = require("../models/userModel");
const { sendSMS } = require("../services/notification");
const { generateToken, hashPassword, comparePasswords } = require("../utils/auth");
require("dotenv").config();
const Loan = require("../models/loanModel");


// ========== REGISTER USER ==========
async function registerUser(req, res, next) {
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Ensure phone number is in international format (with +)
    const formattedPhoneNumber = phone.startsWith('+') ? phone : `+${phone}`;

    try {
        // Check if user with the same email already exists
        const finduser = await User.findOne({ email });
        if (finduser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await hashPassword(password);

        // Create a new user
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || "user", // Default role to "user" if not provided
        });

        await user.save(); // Save the user to the database

        const token = generateToken(user._id, user.role); // Generate a JWT token

        // Send a welcome SMS to the user
        await sendSMS(formattedPhoneNumber, "Welcome to QuickCash! Your account is now active.");

        // Set the token in an HTTP-only cookie (for security)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
        });

        // Respond with the created user
        res.status(201).json({ success: true, user });
    } catch (error) {
        next(error); // Pass error to global error handler
    }
}


// ========== LOGIN USER ==========
async function loginUser(req, res, next) {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        // Compare passwords
        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        const token = generateToken(user._id, user.role); // Generate JWT token

        // Set the token in an HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error); // Pass error to handler
    }
}


// ========== LOGOUT USER ==========
async function logoutUser(req, res, next) {
    try {
        // Clear the token cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        next(error); // Handle unexpected errors
    }
}


// ========== GET USER LOANS ==========
async function getUserLoans(req, res, next) {
    try {
        // Fetch all loans belonging to the logged-in user
        const loans = await Loan.find({ userId: req.user._id });

        // Identify the currently active loan (status is approved or disbursed)
        const currentLoan = loans.find(loan =>
            ["approved", "disbursed"].includes(loan.status)
        );

        // Use current loan amount as balance (can be refined to consider repayments)
        const loanBalance = currentLoan ? currentLoan.amount : 0;

        // Map through loans and return key info with status
        res.status(200).json({
            success: true,
            loans: loans.map(loan => ({
                id: loan._id,
                amount: loan.amount,
                totalRepayment: loan.totalRepayment,
                dueDate: loan.dueDate,
                status: loan.status,
            })),
            currentBalance: loanBalance,
        });
    } catch (error) {
        next(error); // Centralized error handling
    }
}


// ========== DELETE USER ACCOUNT ==========
const deleteUser = async (req, res, next) => {
    try {
        console.log("Delete user called"); // Debug log
        console.log("Authenticated user:", req.user); // Debug log

        const userId = req.user._id; // Get user ID from auth middleware

        // Find and delete user by ID
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error('User not found');
        }

        res.status(200).json({
            success: true,
            message: 'User account deleted successfully',
        });
    } catch (error) {
        console.error("Error in deleteUser:", error.message); // Extra debug logging
        next(error); // Pass to error handler
    }
};


// Export controller functions for use in routes
module.exports = { registerUser, loginUser, logoutUser, deleteUser, getUserLoans };
