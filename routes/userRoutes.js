const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../model/UserModel');
const sendEmail = require('../middleware/emailService');
const dotenv = require('dotenv');
const dns = require('dns');
dotenv.config();



// Login Route with Role Check
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the role is 'User'
        if (user.role !== 'User') {
            return res.status(403).json({ message: 'Access denied: Only users with role "User" can log in' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET, // Secret key from .env
            { expiresIn: '2h' } // Token expires in 2 hours
        );

        // Send JWT token to frontend
        res.status(200).json({
            message: 'Login successful',
            token, 
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                carNumber: user.carNumber,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});


// Admin Login Route (No Token Logic)
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check if the role is 'Admin'
        if (user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied: Only admins can log in' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Send Admin details (No JWT Token)
        res.status(200).json({
            message: 'Admin login successful',
            admin: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new user
router.post('/create', async (req, res) => {
    try {
        const { firstName, lastName, role, email, password, phoneNumber, carNumber } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstName,
            lastName,
            role,
            email,
            password: hashedPassword,
            phoneNumber,
            carNumber
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Route to send a temporary password
router.post('/send-temp-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if(user){
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Generate a random temporary password
        const tempPassword = crypto.randomBytes(4).toString('hex'); 

        // Hash the temp password before saving (uncomment if needed)
        // const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Send email with the temporary password
        const subject = 'Your Temporary Password';
        const text = `Hello,\n\nYour temporary password is: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nBest regards,\nYour Support Team`;

        const emailSent = await sendEmail(email, subject, text);

        if (emailSent) {
            return res.status(200).json({
                message: 'Temporary password sent to email',
                tempPassword
            });
        } else {
            return res.status(404).json({ message: "Email doesn't exist" });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});


// Fetch a user by email
router.get('/getu/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all users
router.get('/getusers', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a user by email
router.delete('/delete/:email', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
