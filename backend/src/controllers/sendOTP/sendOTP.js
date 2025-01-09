const { client_update } = require('../../configuration/database/databaseUpdate.js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.OTP_EMAIL,
        pass: process.env.OTP_PASSWORD
    }
});

// Function to send OTP email
async function sendOTPEmail(recipientEmail, otp) {
    const mailOptions = {
        from: process.env.OTP_EMAIL,
        to: recipientEmail,
        subject: 'Your OTP Code (Valid for 90 seconds)',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>OTP Verification</h2>
                <p>Your OTP code is: <strong>${otp}</strong></p>
                <p>This code will expire in 90 seconds. Please use it immediately.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send OTP email');
    }
}

exports.sendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required',
        });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format',
        });
    }

    try {
        // Begin transaction
        await client_update.query('BEGIN');

        const checkUserQuery = `
            SELECT email 
            FROM app."users" 
            WHERE email = $1
        `;

        const userExists = await client_update.query(checkUserQuery, [email]);

        if (userExists.rows.length === 0) {
            await client_update.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'This email is not registered',
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash the OTP
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);

        // Delete any existing OTP for this email
        await client_update.query(
            'DELETE FROM app."OTP_tracker" WHERE email = $1',
            [email]
        );

        // Insert new hashed OTP
        const insertOtpQuery = `
            INSERT INTO app."OTP_tracker" (email, "OTP", "OTP_disable", created_at)
            VALUES ($1, $2, false, CURRENT_TIMESTAMP)
        `;

        await client_update.query(insertOtpQuery, [email, hashedOTP]);

        // Send OTP via email
        try {
            await sendOTPEmail(email, otp);
            await client_update.query('COMMIT');
        } catch (emailError) {
            await client_update.query('ROLLBACK');
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email',
                error: emailError.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP generated and sent successfully. Valid for 90 seconds.',
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error in sendOTP:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating OTP',
            error: error.message
        });
    }
};