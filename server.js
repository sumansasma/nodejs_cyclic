const cors = require('cors');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail' or 'SendGrid'
    auth: {
        user: 'sijgeriaucssangha@gmail.com', // Replace with your email
        pass: 'Sijgeria2003@' // Replace with your email password
    }
});

function sendRegistrationConfirmation(email, participantName) {
    const mailOptions = {
        from: 'sijgeriaucssangha@gmail.com', // Replace with your email
        to: email,
        subject: 'Registration Confirmation',
        text: `Hello ${participantName},\n\nThank you for registering for our event. Your registration is confirmed.\n\nRegards,\nYour Event Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/test/public'));

// Default route to serve the event creation page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/createEvent.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/test/createEvent.html'); // Send the event creation page
});

app.get('/test', (req, res) => {
    res.send('Backend server is running!');
});

// Define a DELETE route for /api/events/:eventId
app.delete('/api/events/:eventId', (req, res) => {
    const eventId = req.params.eventId;

    // Replace this with your actual database query to delete the event by ID
    db.run('DELETE FROM events WHERE id = ?', [eventId], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Error deleting the event.' });
        }

        res.status(200).json({ message: 'Event deleted successfully.' });
    });
});



// Create a SQLite database and initialize tables
const db = new sqlite3.Database('events.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the events database.');
        // Create tables for events and participants if they don't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                date DATE
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                eventId INTEGER,
                name TEXT,
                phoneNumber TEXT,
                FOREIGN KEY (eventId) REFERENCES events(id)
            )
        `);
    }
});

// Define a GET route for /api/participants/:eventId
app.get('/api/participants/:eventId', (req, res) => {
    const eventId = req.params.eventId;

    // Replace this with your actual database query to fetch participants by event ID
    db.all('SELECT * FROM participants WHERE eventId = ?', [eventId], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Error fetching participants.' });
        }

        // Send a JSON response with the participants
        res.json(rows);
    });
});


// Define a GET route for /api/events
app.get('/api/events', (req, res) => {
    // Fetch events from the database
    db.all('SELECT * FROM events', (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Error fetching events.' });
        }

        // Send a JSON response with the events
        res.json(rows);
    });
});

// Define a GET route for /api/participants
app.get('/api/participants', (req, res) => {
    // Fetch participants from the database or data source
    // Example: Fetching participants from a SQLite database
    const sql = 'SELECT * FROM participants';

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Error fetching participants.' });
        }

        // Send a JSON response with the participants
        res.json(rows);
    });
    const {  name, email } = req.body;

    if ( !name  || !email) {
        return res.status(400).json({ message: 'Event ID, name, phone number, and email are required.' });
    }

    db.run('INSERT INTO participants (eventId, name, phoneNumber, email) VALUES (?, ?, ?, ?)', [eventId, name, phoneNumber, email], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Participant registration failed.' });
        }

        sendRegistrationConfirmation(email, name); // Send confirmation email

        res.status(201).json({ message: 'Participant registered successfully.', participantId: this.lastID });
    });
});


// API endpoints for creating events and registering participants
app.post('/api/events', (req, res) => {
    const { name, phoneNumber, email } = req.body; // Extract data from the request body

    if (!name || !phoneNumber || !email) {
        return res.status(400).json({ message: 'Event ID, name, phone number, and email are required.' });
    }

    db.run('INSERT INTO events (eventId, name, date) VALUES (?, ?, ?)', [eventId, name, date], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Event creation failed.' });
        }

        sendRegistrationConfirmation(email, name); // Send confirmation email

        res.status(201).json({ message: 'Event created successfully.', eventId: this.lastID });
    });
});

app.post('/api/participants', (req, res) => {

    db.run('INSERT INTO participants (eventId, name, phoneNumber) VALUES (?, ?, ?)', [eventId, name, phoneNumber], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Participant registration failed.' });
        }

        res.status(201).json({ message: 'Participant registered successfully.', participantId: this.lastID });
    });
});

module.exports = sendRegistrationConfirmation;


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
