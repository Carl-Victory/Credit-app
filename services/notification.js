require("dotenv").config(); // Load environment variables (e.g., Twilio credentials and phone numbers)
const twilio = require("twilio")( // Initialize Twilio with account SID and auth token from environment variables
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Function to validate phone number format (E.164 format)
function validatePhoneNumber(phoneNumber) {
    const e164Regex = /^\+[1-9]\d{1,14}$/; // E.164 format regex: international phone numbers
    if (!e164Regex.test(phoneNumber)) {
        throw new Error(`Invalid phone number format: ${phoneNumber}`); // If phone number doesn't match format, throw an error
    }
}

// Function to send an SMS
async function sendSMS(to, message) {
    try {
        validatePhoneNumber(to); // Validate phone number format before sending the SMS
        await twilio.messages.create({
            body: message, // Message content
            from: process.env.TWILIO_PHONE_NUMBER, // Sender's phone number from environment variable
            to: to, // Recipient's phone number
        });
        return { success: true }; // Return success if the message is sent successfully
    } catch (error) {
        throw new Error(`Failed to send SMS: ${error.message}`); // Throw error if sending SMS fails
    }
}

// Function to send a WhatsApp message
async function sendWhatsApp(to, message) {
    try {
        await twilio.messages.create({
            body: message, // Message content
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Sender's WhatsApp number from environment variable
            to: `whatsapp:+${to}`, // Recipient's WhatsApp number (formatted in international E.164 format)
        });
        return { success: true }; // Return success if the message is sent successfully
    } catch (error) {
        throw new Error(`Failed to send WhatsApp message: ${error.message}`); // Throw error if sending WhatsApp message fails
    }
}

module.exports = { sendSMS, sendWhatsApp }; // Export functions for use in other parts of the app
