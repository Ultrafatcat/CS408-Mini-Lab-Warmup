const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { canvasGetAll } = require('./canvas');

const app = express();
app.use(cors());

app.get('/api/hello', (req, res) => {
    res.json({ 
        message: 'Hello from the server!' 
    });
});

app.get('/api/courses', async (req, res) => {
    try {
        const url = `${process.env.CANVAS_BASE_URL}/api/v1/courses?enrollment_state=active`;
        const courses = await canvasGetAll(url);
        res.json(courses);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.get('/api/courses/:courseId/assignments', async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId.match(/^\d+$/)) {
            return res.status(400).json({ error: 'Invalid course ID' });
        }

        const url = new URL(`${process.env.CANVAS_BASE_URL}/api/v1/courses/${courseId}/assignments`);
        url.searchParams.append('order_by', 'due_at');
        url.searchParams.append('include[]', 'submission');

        const assignments = await canvasGetAll(url.toString());
        res.json(assignments);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});