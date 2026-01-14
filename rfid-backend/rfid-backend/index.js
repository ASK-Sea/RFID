require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const startMQTT = require('./mqtt');

const app = express();
app.use(cors());
app.use(express.json());

// Attach API routes
app.use('/api', routes);

// Start MQTT listener
startMQTT();

// Start express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));