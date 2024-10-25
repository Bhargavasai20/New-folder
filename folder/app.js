const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// MySQL Database Connection
const pool = mysql.createPool({
    host: 'localhost',          // Replace with your database host
    user: 'root',      // Replace with your database username
    password: 'sai@123',  // Replace with your database password
    database: 'contact_management',  // Replace with your database name
});

// User Registration
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error('Registration error:', error); // Log the error
        res.status(400).send('Error registering user.');
    }
});


// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (user.length && await bcrypt.compare(password, user[0].password)) {
        const token = jwt.sign({ id: user[0].id }, 'your_jwt_secret'); // Replace with your JWT secret
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials.');
    }
});

// Add Contact
app.post('/contacts', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        await pool.query('INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)', [name, email, phone]);
        res.status(201).send('Contact added successfully.');
    } catch (error) {
        res.status(400).send('Error adding contact.');
    }
});

// Get Contacts
app.get('/contacts', async (req, res) => {
    const [contacts] = await pool.query('SELECT * FROM contacts');
    res.json(contacts);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
