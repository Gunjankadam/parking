// Requiring module
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db/database');
const userRoutes = require('./routes/userRoutes');

// Creating express object
// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
connectDB();


// Handling GET request
app.get('/', (req, res) => { 
    res.send('A simple Node App is '
        + 'running on this server') 
    res.end() 
})

app.use('/user', userRoutes); 

// Server Setup
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});