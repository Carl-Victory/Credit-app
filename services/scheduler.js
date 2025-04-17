const cron = require('node-cron'); // Import cron for scheduling jobs
const Loan = require('../models/loanModel'); // Import Loan model
const Repayment = require('../models/repaymentModel'); // Import Repayment model
const { chargeUser } = require('./payment'); // Import chargeUser function to process payments
const { updateRepaymentStatus } = require('../controllers/loanController'); // Import repayment status updater

// Schedule a job to run every day at midnight (0 0 * * *)
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled job for loan repayment and overdue tracking');

    try {
        // Find loans with auto-debit enabled and approved status
        const autoDebitLoans = await Loan.find({ repaymentMethod: 'auto-debit', status: 'approved' });

        for (const loan of autoDebitLoans) {
            // Find the next pending repayment for this loan
            const repayment = await Repayment.findOne({ loanId: loan._id, status: 'pending' }).sort({ dueDate: 1 });

            if (repayment && repayment.dueDate <= new Date()) { // Check if repayment is overdue
                try {
                    // Attempt to automatically charge the user
                    const result = await chargeUser(loan.paymentMethod, repayment.amountDue);

                    // Update repayment details as paid
                    repayment.amountPaid = repayment.amountDue;
                    repayment.status = 'paid';
                    repayment.paidAt = new Date();
                    await repayment.save(); // Save updated repayment

                    // Update the loan's repaid amount
                    loan.repaidAmount = (loan.repaidAmount || 0) + repayment.amountDue;
                    if (loan.repaidAmount >= loan.amount) {
                        loan.status = 'repaid'; // Mark loan as fully repaid if amount is met
                    }
                    await loan.save(); // Save updated loan status

                    console.log(`Loan repayment successful for loan ID: ${loan._id}`);
                } catch (error) {
                    console.error(`Failed to process repayment for loan ID: ${loan._id}: ${error.message}`);
                }
            }
        }

        // Update the status of overdue repayments
        await updateRepaymentStatus();
    } catch (error) {
        console.error(`Error running scheduled job: ${error.message}`);
    }
});

// Schedule the task to run every day at midnight for repayment status update
cron.schedule("0 0 * * *", async () => {
    console.log("Running daily repayment status update...");
    await updateRepaymentStatus(); // Update repayment statuses
});

// Export the scheduler to be used elsewhere
module.exports = { startScheduler: () => console.log("Scheduler started.") };
