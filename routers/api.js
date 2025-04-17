const express = require("express"); // Import Express to handle HTTP requests
const router = express.Router(); // Initialize the router for handling routes

// Middleware imports
const { protect, kycVerified, adminOnly, blacklistCheck } = require("../middleware/authMiddleware");

// Controller imports for user, admin, loan, and KYC management
const {
    registerUser, // Register a new user
    loginUser, // User login
    deleteUser, // Delete a user account
    logoutUser, // Log out a user
    getUserLoans // Get all loans for a user
} = require("../controllers/userController");

const {
    flagUser, // Flag a user for review
    generateReport, // Generate admin reports
    getAllUsers, // Retrieve all users
    getOwingUsers // Get users who owe loans
} = require("../controllers/adminController");

const {
    applyForLoan, // Apply for a new loan
    approveLoan, // Approve or reject loan applications
    repayLoan, // Repay loan
    getRepaymentHistory, // Get history of loan repayments
    getLoanDetails // Get loan details
} = require("../controllers/loanController");

const { submitKYC } = require("../controllers/kycController"); // KYC submission functionality

// User routes
router.post("/user/register", registerUser); // Register a new user
router.post("/user/login", loginUser); // Log in a user
router.post("/user/logout", logoutUser); // Log out a user
router.delete('/user/delete', protect, deleteUser); // Delete user (protected route)
router.get('/user/loans', protect, getUserLoans); // Get user loans (protected route)

// Loan routes
router.post("/loan/apply", protect, kycVerified, blacklistCheck, applyForLoan); // Apply for loan, protected
router.put("/loan/:loanId/approve", protect, adminOnly, approveLoan); // Admin approves or rejects loan
router.post('/loan/repay', protect, repayLoan); // Repay loan
router.get('/loan/:loanId/repayments', protect, getRepaymentHistory); // Get repayment history
router.get('/loan/:loanId', protect, getLoanDetails); // Get loan details

// KYC Submission (Protected route)
router.post("/kyc", protect, submitKYC); // Submit KYC details for user

// Admin-only routes
router.put("/admin/loans/:loanId", protect, adminOnly); // Admin reviews loan
router.put("/admin/users/:userId/flag", protect, adminOnly, flagUser); // Admin flags user for review
router.get("/admin/reports", protect, adminOnly, generateReport); // Admin generates report
router.get('/admin/users', protect, adminOnly, getAllUsers); // Admin gets list of all users
router.get('/admin/owing-users', protect, adminOnly, getOwingUsers); // Admin gets list of users owing loans

module.exports = router; // Export the router for use in the app
