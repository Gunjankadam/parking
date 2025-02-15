const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10,15}$/, 'Please enter a valid phone number']
    },
    carNumber: {
        type: String,
        required: false,
        unique: true,
        uppercase: true,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

