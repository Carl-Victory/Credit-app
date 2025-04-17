const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userModel");

// Protect routes (user must be logged in)
const protect = async (req, res, next) => {
    let token;

    // Extract token from cookies
    if (req.cookies.token) {
        token = req.cookies.token;
    }

    // If no token is found, return unauthorized error
    if (!token) {
        console.log("No token provided"); // Debug log
        return res.status(401).json({ success: false, error: "Not authorized, no token provided" });
    }

    try {
        // Verify token and decode payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request object without password
        req.user = await User.findById(decoded.id).select("-password");

        // If user no longer exists in DB
        if (!req.user) {
            return res.status(401).json({ success: false, error: "Not authorized, user not found" });
        }

        next(); // Proceed to next middleware
    } catch (error) {
        // Invalid token or other error
        return res.status(401).json({ success: false, error: "Not authorized, invalid token" });
    }
};

// Check if user has completed KYC verification
const kycVerified = (req, res, next) => {
    if (req.user.kycStatus !== "verified") {
        return res.status(403).json({
            success: false,
            message: "You must complete KYC verification to apply for a loan.",
        });
    }
    next(); // User is verified, proceed
};

// Restrict access to admin-only routes
const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return next(new Error("Admin access required")); // Pass error to centralized error handler
    }
    next(); // User is admin, proceed
};

// Block access for blacklisted users
const blacklistCheck = (req, res, next) => {
    if (req.user.blacklisted) {
        return res.status(403).json({
            success: false,
            message: "You are blacklisted and cannot apply for loans.",
        });
    }
    next(); // User not blacklisted, proceed
};

// Export all middleware functions
module.exports = { protect, adminOnly, kycVerified, blacklistCheck };
