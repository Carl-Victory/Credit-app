
# Loan Management System API

Welcome to the Loan Management System API, a backend service designed to handle loan applications, approvals, repayments, and user management. This API is built using Node.js, Express, and MongoDB, and includes features such as flexible loan repayments, automatic penalty handling, and user authentication.

## Features

- ### User Management:
    -User registration, login, and logout.
    -KYC (Know Your Customer) submission and verification.
    -Blacklisting users for fraudulent activities.
- ### Loan Management:
    -Users can apply for loans with a specified amount and tenure.
    -Admins can approve or reject loan applications.
    -Flexible loan repayment system (users can repay any amount at any time before the due date).
    -Automatic penalties for overdue repayments.
- ### Repayment Management:
    -Users can view their repayment history.
    -Automatic updates for overdue repayments, including penalty application and notifications.
- ### Admin Features:
    -Admins can flag users as blacklisted.
    -Admins can generate reports and view users who owe loans.
- ### Notifications:
    -SMS notifications for loan approvals, rejections, overdue repayments, and penalties.
## Project Architecture
### 1. Folder Structure
```
loan/
├── controllers/         # Contains business logic for handling API requests
│   ├── adminController.js
│   ├── kycController.js
│   ├── loanController.js
│   └── userController.js
├── dbConnection/        # Database connection logic
│   └── mongoDb.js
├── middleware/          # Middleware for authentication, error handling, etc.
│   ├── authMiddleware.js
│   └── errorHandler.js
├── models/              # Mongoose models for MongoDB collections
│   ├── loanModel.js
│   ├── repaymentModel.js
│   ├── userModel.js
│   └── kycModel.js
├── routers/             # API route definitions
│   └── api.js
├── services/            # Utility services for payments, notifications, etc.
│   ├── payment.js
│   ├── scheduler.js
│   └── smsService.js
├── .env                 # Environment variables
├── index.js             # Entry point of the application
└── package.json         # Project dependencies and scripts
```
### 2. Key Components

### Controllers

- userController.js:
    - Handles user registration, login, logout, and loan retrieval.

- loanController.js:
    - Manages loan applications, approvals, repayments, and overdue penalties.

- adminController.js:
    - Admin-only features like blacklisting users and generating reports.

- kycController.js:
    - Handles KYC submissions and updates user verification status.

### Models

- userModel.js:
    - Stores user information, including kycStatus and blacklisted status.

- loanModel.js:
    - Tracks loan details such as amount, totalRepayment, repaidAmount, status, and dueDate.

- repaymentModel.js:
    - Tracks individual repayment records (if needed for detailed repayment history).

- kycModel.js:
    - Stores KYC data such as employer, salary, and bank account details.

### Middleware

- authMiddleware.js:
    - Protects routes by verifying JWT tokens and user roles.

- errorHandler.js:
    - Centralized error handling for API responses.

### Services
- payment.js:
    - Handles payment processing using Stripe.

- scheduler.js:
    - Automates tasks like updating overdue repayments and applying penalties.

- smsService.js:
    - Sends SMS notifications to users for important events.

## Project Logic

### 1. Loan Application

- Users apply for loans by specifying the amount and tenureDays.
- The system calculates the totalRepayment using compound interest (0.04% per day).
- Loans are saved with a status of "pending" until approved by an admin.

### 2. Loan Approval

- Admins can approve or reject loans.
- Approved loans are marked with a status of "approved".
- Users are notified via SMS upon approval or rejection.

### 3. Loan Repayment

- Users can repay any amount at any time before the due date.
- The repaidAmount field in the loan record is updated dynamically.
- If the repaidAmount equals or exceeds the totalRepayment, the loan is marked as "repaid".

### 4. Automatic Penalty Handling

- The scheduler.js service runs daily to check for overdue loans.
- Overdue loans are marked as "late", and a penalty is added to the totalRepayment.
- Users are notified via SMS about the penalty.

### 5. Repayment History

- Users can view their repayment history for a specific loan.
- If no repayments have been made, the system returns a message: "No repayments have been made."

### 6. Blacklisting Users

- Admins can flag users as blacklisted.
- Blacklisted users cannot apply for new loans.


## Setup Instructions

### 1. Clone the Repository
```
git clone https://github.com/your-username/loan-management-system.git
cd loan-management-system
```
### 2. Install Dependencies
```
npm install
```
### 3. Set Up Environment Variables
Create a .env file in the root directory and add the following:
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=jwt_secret_key
TWILIO_ACCOUNT_SID= 
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=
STRIPE_TEST_KEY=your_stripe_test_key
```

### 4. Start the Server
```
npm start
```
### 5. Test the API
Use tools like Postman or cURL to test the endpoints.

## Future Enhancements

-Add email notifications as an alternative to SMS.
-Implement loan analytics and reporting dashboards.
-Add support for multiple currencies in loan repayments.
-Enhance security with rate limiting and input validation.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.


