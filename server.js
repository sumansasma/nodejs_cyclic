const cors = require('cors');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

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
});


// API endpoints for creating events and registering participants
app.post('/api/events', (req, res) => {
    const { name, date } = req.body;

    if (!name || !date) {
        return res.status(400).json({ message: 'Event name and date are required.' });
    }

    db.run('INSERT INTO events (name, date) VALUES (?, ?)', [name, date], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Event creation failed.' });
        }

        res.status(201).json({ message: 'Event created successfully.', eventId: this.lastID });
    });
});

app.post('/api/participants', (req, res) => {
    const { eventId, name, phoneNumber } = req.body;

    if (!eventId || !name || !phoneNumber) {
        return res.status(400).json({ message: 'Event ID, name, and phone number are required.' });
    }

    db.run('INSERT INTO participants (eventId, name, phoneNumber) VALUES (?, ?, ?)', [eventId, name, phoneNumber], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Participant registration failed.' });
        }

        res.status(201).json({ message: 'Participant registered successfully.', participantId: this.lastID });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});