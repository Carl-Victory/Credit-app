require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_TEST_KEY);



console.log("Stripe API Key:", process.env.STRIPE_TEST_KEY);

async function testStripeConnection() {
    try {
        const balance = await stripe.balance.retrieve();
        console.log("Stripe connection successful:", balance);
    } catch (error) {
        console.error("Stripe connection failed:", error.message);
    }
}

testStripeConnection();