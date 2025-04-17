function errorHandler(err, req, res, next) {
    console.error(err.stack); // Log the error stack for debugging

    const statusCode = err.statusCode || 500; // Default to 500 if no status code is set
    const message = err.message || "Internal Server Error"; // Default error message

    res.status(statusCode).json({
        success: false, // Indicate operation failed
        error: message, // Send error message in response
    });
}

module.exports = errorHandler; // Export the error handling middleware
