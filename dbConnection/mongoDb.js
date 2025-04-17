//We reuire mongoose a module from installed dependencies
const mongoose = require('mongoose');
//We require our .env
require('dotenv').config();

//We define a function to connect to our mongodb database
const connectDB = async (req, res) => {
    try {
        //We connect to Mongodb usinig the connection string 
        await mongoose.connect(process.env.MONGO_URL)
        // If the connection is successful, log a success message to the console
        console.log('Database connected');
    } catch (error) {
        //If process fails, display in our terminal
        console.log(error);
    }
}

//export mongodb connection function
module.exports = connectDB;