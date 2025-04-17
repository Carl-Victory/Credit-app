const jwt = require("jsonwebtoken"); // Import JWT for creating and verifying tokens
const bcrypt = require("bcryptjs"); // Import bcrypt for hashing and comparing passwords
require("dotenv").config(); // Load environment variables from .env file

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: "30d", // Token expires in 30 days
    });
};

// Hash password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10); // Hash password with a salt round of 10
};

// Compare passwords
const comparePasswords = async (inputPassword, userPassword) => {
    return await bcrypt.compare(inputPassword, userPassword); // Compare input password with stored hash
};

module.exports = { generateToken, hashPassword, comparePasswords }; // Export functions for use in other parts of the app
