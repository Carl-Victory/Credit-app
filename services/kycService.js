const KYC = require("../models/kycModel"); // Import KYC model for accessing KYC data
const User = require("../models/userModel"); // Import User model to update user KYC status
require("dotenv").config(); // Load environment variables (e.g., for configuration)

// Function to verify KYC status of a user
async function verifyKYC(userId) {
  try {
    // 1. Fetch KYC data for the given user
    const kyc = await KYC.findOne({ userId }); // Retrieve KYC document from the database
    if (!kyc) throw new Error("KYC data not found"); // If no KYC data, throw an error

    // 2. Mock validation (replace with real API later)
    const isApproved = !!( // Check if employment and bank account information are present
      kyc.employment?.employer &&
      kyc.bankAccount?.accountNumber
    );

    // 3. Update user's KYC status
    await User.updateOne( // Update the user model with the new KYC status
      { _id: userId },
      { kycStatus: isApproved ? "approved" : "rejected" } // Set status based on validation result
    );

    // 4. Log the time of verification if approved
    if (isApproved) {
      await KYC.updateOne({ userId }, { verifiedAt: new Date() }); // Update the KYC document with verification timestamp
    }

    return { success: isApproved }; // Return the result of the KYC verification
  } catch (error) {
    console.error("KYC verification failed:", error.message); // Log any errors that occur
    return { success: false, error: error.message }; // Return failure status with error message
  }
}

module.exports = { verifyKYC }; // Export the verifyKYC function for use in other parts of the app
