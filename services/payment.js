require("dotenv").config(); // Load environment variables, including Stripe test key
const stripe = require("stripe")(process.env.STRIPE_TEST_KEY); // Initialize Stripe with the test key from environment variables

// Function to disburse loan to user's bank
async function disburseLoan(amount, recipientAccount) {
    try {
        if (!amount || amount <= 0) { // Validate if the amount is valid
            throw new Error("Invalid amount"); // Throw error if amount is invalid
        }

        // Simulate disbursement in test mode (real transfers would be done here in production)
        return {
            success: true, // Return success status
            transfer: {
                id: "test_transfer_id", // Mock transfer ID
                amount, // Disbursed amount
                recipientAccount: recipientAccount || "test_account", // Recipient's account (fallback to test account)
            },
            message: "Funds disbursed (TEST MODE - no real money moved)", // Message indicating it's in test mode
        };
    } catch (error) {
        throw new Error(`Disbursement Error: ${error.message}`); // Throw error for centralized handling
    }
}

// Function to charge user for repayment
async function chargeUser(paymentMethod, amount) {
    try {
        if (!amount || amount <= 0) { // Validate if the amount is valid
            throw new Error("Invalid amount"); // Throw error if amount is invalid
        }
        if (!paymentMethod) { // Ensure payment method is provided
            throw new Error("Payment method is required"); // Throw error if payment method is missing
        }

        // Create a payment intent via Stripe's API
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert amount to cents (Stripe works in cents)
            currency: "usd", // Currency for the transaction
            payment_method: paymentMethod, // Payment method to charge
            confirm: true, // Automatically confirm the payment
        });

        return { success: true, charge: paymentIntent }; // Return success with payment intent details
    } catch (error) {
        throw new Error(`Repayment Error: ${error.message}`); // Throw error for centralized handling
    }
}

module.exports = { disburseLoan, chargeUser }; // Export functions to be used elsewhere in the app
