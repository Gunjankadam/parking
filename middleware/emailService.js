const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const emailExistence = require('email-existence');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "scanpass01@gmail.com", 
        pass: "tuhm vehq fkbn nffr",
    },
});

const verifyEmail = (email) => {
    return new Promise((resolve) => {
        emailExistence.check(email, (err, res) => {
            if (err) {
                console.error('Email verification error:', err);
                resolve(false);
            } else {
                console.log(`Email ${email} exists:`, res);
                resolve(res);
            }
        });
    });
};

const sendEmail = async (to, subject, text) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
        console.log('Invalid email format');
        return false;
    }

    const emailExists = await verifyEmail(to);
    if (!emailExists) {
        console.log('Email does not exist');
        return false;
    }

    try{
        const info = await transporter.sendMail({
            from: "scanpass01@gmail.com",
            to,
            subject,
            text,
        });
       return true;
    } catch (error) {
        console.error("Email sending failed:", error);
        return false; 
    }
};

module.exports = sendEmail;