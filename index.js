require("dotenv").config(); // Load environment variables from .env file
const express = require('express'); // Import express for creating the app
const mongoose = require('mongoose'); // Import mongoose for interacting with MongoDB
const cookieParser = require('cookie-parser'); // Import cookie-parser for handling cookies
const connectDB = require('./dbConnection/mongoDb'); // Import custom function to connect to MongoDB
const apiRoutes = require("./routers/api"); // Import API routes
const { disburseLoan, chargeUser } = require('./services/payment'); // Import payment services
const stripe = require("stripe")(process.env.STRIPE_TEST_KEY); // Import Stripe for payment processing
const errorHandler = require('./middleware/errorHandler'); // Import error handling middleware
require('./services/scheduler'); // Initialize the scheduler
const { startScheduler } = require("./services/scheduler"); // Import startScheduler function from scheduler service

// Start the scheduler
startScheduler();

const app = express(); // Create an Express application
const port = process.env.PORT; // Get the port from environment variables

// Middleware
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookies from incoming requests
app.use(errorHandler); // Use error handling middleware

// Routes
app.use("/api", apiRoutes); // Use the API routes for any path starting with /api

// Connect to the MongoDB database
connectDB();

// Test route
app.get('/', (req, res) => {
    res.send('Welcome to my Loan App API'); // Simple welcome message for the test route
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`); // Log a message indicating the server is running
});


// The following block is commented out for testing purposes:

/*
// Test disbursement
async function testDisbursement() {
    const result = await disburseLoan(100, 'test_account'); // Simulated account
    console.log(result);
}

testDisbursement();

// Test repayment
async function testRepayment() {
    try {
        // Create a PaymentMethod using the test card number
        const paymentMethod = await stripe.paymentMethods.create({
            type: "card",
            card: {
                number: "4242424242424242", // Test card number
                exp_month: 12,
                exp_year: 2025,
                cvc: "123",
            },
        });

        // Charge the created PaymentMethod
        const result = await chargeUser(paymentMethod.id, 50); // Pass the PaymentMethod ID
        console.log(result);
    } catch (error) {
        console.error("Test Repayment Error:", error.message);
    }
}

testRepayment();
*/
