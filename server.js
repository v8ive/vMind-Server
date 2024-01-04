// server.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const cors = require('cors');

const app = express();

// Logger configuration
const logDirectory = path.join(__dirname, 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'log/combined.log' })
    ],
});

// Stream for Morgan which uses Winston to log
const stream = {
    write: message => logger.info(message.trim()),
};

// Morgan HTTP request logger setup to use Winston
app.use(morgan('combined', { stream }));


const pool = new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
});

pool.on('connect', () => logger.info('Connected to the database.'));
pool.on('error', err => logger.error('Unexpected error on idle client', err));

app.use(bodyParser.json());

// Define your API endpoints here

app.get('/bank', async (req, res) => {
    console.log('Got Request!');
    try {
        console.log('Trying...');
        const result = await pool.query('SELECT * FROM bank');
        console.log(result);
        res.json(result.rows);
    } catch (error) {
        console.log('Error!');
        console.log(error);
        logger.info(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));