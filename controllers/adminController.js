// Import required models and configurations
const Loan = require("../models/loanModel"); // Loan model for loan-related operations
const User = require("../models/userModel"); // User model for user-related operations
require("dotenv").config(); // Load environment variables from .env file

/**
 * Flag a user as fraudulent (Admin-only endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with success status and user data
 */
async function flagUser(req, res, next) {
    const { userId } = req.params; // Extract userId from request parameters

    try {
        // Find user by ID and update their blacklisted status to true
        const user = await User.findByIdAndUpdate(
            userId,
            { blacklisted: true }, // Update operation
            { new: true } // Return the updated document
        );

        // Handle case where user is not found
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Return success response with updated user data
        res.status(200).json({ success: true, message: "User has been blacklisted.", user });
    } catch (error) {
        // Pass any errors to the error handling middleware
        next(error);
    }
}

/**
 * Generate loan reports showing approved loans (Admin-only endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with loan statistics
 */
async function generateReport(req, res, next) {
    try {
        // Find all loans with 'approved' status
        const loans = await Loan.find({ status: "approved" });
        const totalLoans = loans.length; // Count of approved loans
        // Calculate total amount of all approved loans
        const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);

        // Return loan statistics
        res.status(200).json({ success: true, totalLoans, totalAmount });
    } catch (error) {
        // Pass any errors to the error handling middleware
        next(error);
    }
}

/**
 * Get all users in the system (Admin-only endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with list of all users (passwords excluded)
 */
async function getAllUsers(req, res, next) {
    try {
        // Find all users and exclude password fields from the response
        const users = await User.find({}).select('-password');
        res.status(200).json({ success: true, users });
    } catch (error) {
        // Pass any errors to the error handling middleware
        next(error);
    }
}

/**
 * Get users with outstanding loans (Admin-only endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with list of owing users and their total debts
 */
async function getOwingUsers(req, res, next) {
    try {
        // Aggregate pipeline to find users with active loans and calculate their total debt
        const owingUsers = await Loan.aggregate([
            // Match only active loans (approved or disbursed)
            { $match: { status: { $in: ["approved", "disbursed"] } } },
            // Group by user ID and sum their loan amounts
            { $group: { _id: "$userId", totalDebt: { $sum: "$amount" } } },
            // Join with users collection to get user details
            {
                $lookup: {
                    from: "users", // Collection to join
                    localField: "_id", // Field from loans
                    foreignField: "_id", // Field from users
                    as: "user" // Output array field
                }
            },
            // Convert the user array to an object
            { $unwind: "$user" },
            // Exclude password field from the output
            { $project: { "user.password": 0 } }
        ]);

        // Return the list of owing users with their debt totals
        res.status(200).json({ success: true, owingUsers });
    } catch (error) {
        // Pass any errors to the error handling middleware
        next(error);
    }
}

// Export all controller functions
module.exports = { flagUser, generateReport, getAllUsers, getOwingUsers };