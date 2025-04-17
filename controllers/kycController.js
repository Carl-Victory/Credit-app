// Import required models and services
const KYC = require("../models/kycModel"); // KYC model for KYC-related operations
const User = require("../models/userModel"); // User model for user-related operations
const { verifyKYC } = require("../services/kycService"); // KYC verification service
require("dotenv").config(); // Load environment variables from .env file

/**
 * Handle KYC (Know Your Customer) submission
 * @param {Object} req - Express request object containing:
 *   - user._id: Authenticated user's ID (from JWT)
 *   - body: KYC data including employer, salary, accountNumber, bankName
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with submission status and KYC data
 */
async function submitKYC(req, res, next) {
    // Extract user ID from authenticated JWT token
    const userId = req.user._id;
    // Destructure KYC data from request body
    const { employer, salary, accountNumber, bankName } = req.body;

    try {
        // 1. Save or update KYC data in database
        const kyc = await KYC.findOneAndUpdate(
            { userId }, // Find document by user ID
            {
                // Update these fields:
                employment: { employer, salary }, // Employment information
                bankAccount: { accountNumber, bankName }, // Bank account details
            },
            {
                upsert: true, // Create new document if it doesn't exist
                new: true // Return the updated document
            }
        );

        // 2. Update user's KYC status to "verified" in user collection
        await User.findByIdAndUpdate(
            userId,
            { kycStatus: "verified" } // Set KYC status
        );

        // 3. Initiate background verification process (non-blocking)
        verifyKYC(userId); // Runs asynchronously in background

        // Return success response with KYC data
        res.status(200).json({
            success: true,
            message: "KYC submitted. Verification in progress.",
            kyc // Return the saved KYC document
        });
    } catch (error) {
        // Pass any errors to the error handling middleware
        next(error);
    }
}

// Export the controller function
module.exports = { submitKYC };