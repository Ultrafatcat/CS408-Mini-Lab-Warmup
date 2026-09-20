const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/hello', (req, res) => {
    res.json({ 
        message: 'Hello from the server!' 
    });
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});