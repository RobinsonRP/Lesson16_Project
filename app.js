const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer'); // for image upload
const path = require('path');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // save images in /public/uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }
});
const upload = multer({ storage: storage });

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'RP738964$',
    database: 'c237_studentlistapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Routes
// Display all students
app.get('/', (req, res) => {
    connection.query('SELECT * FROM student', (err, results) => {
        if (err) return res.send('Error retrieving students');
        res.render('index', { students: results });
    });
});

// Display single student
app.get('/student/:id', (req, res) => {
    connection.query('SELECT * FROM student WHERE studentId = ?', [req.params.id], (err, results) => {
        if (err) return res.send('Error retrieving student');
        if (results.length > 0) {
            res.render('student', { student: results[0] });
        } else {
            res.send('Student not found');
        }
    });
});

// Add student form
app.get('/addStudent', (req, res) => {
    res.render('addStudent');
});

// Add student (with image upload)
app.post('/addStudent', upload.single('image'), (req, res) => {
    const { name, dob, contact } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : null;
    const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';
    connection.query(sql, [name, dob, contact, image], (err) => {
        if (err) return res.send('Error adding student');
        res.redirect('/');
    });
});

// Update student form
app.get('/updateStudent/:id', (req, res) => {
    connection.query('SELECT * FROM student WHERE studentId = ?', [req.params.id], (err, results) => {
        if (err) return res.send('Error retrieving student for edit');
        if (results.length > 0) {
            res.render('updateStudent', { student: results[0] });
        } else {
            res.send('Student not found');
        }
    });
});

// Update student (with optional new image)
app.post('/updateStudent/:id', upload.single('image'), (req, res) => {
    const { name, dob, contact } = req.body;
    const studentId = req.params.id;
    let sql, params;

    if (req.file) {
        const image = '/uploads/' + req.file.filename;
        sql = 'UPDATE student SET name=?, dob=?, contact=?, image=? WHERE studentId=?';
        params = [name, dob, contact, image, studentId];
    } else {
        sql = 'UPDATE student SET name=?, dob=?, contact=? WHERE studentId=?';
        params = [name, dob, contact, studentId];
    }

    connection.query(sql, params, (err) => {
        if (err) return res.send('Error updating student');
        res.redirect('/');
    });
});

// Delete student
app.get('/deleteStudent/:id', (req, res) => {
    connection.query('DELETE FROM student WHERE studentId = ?', [req.params.id], (err) => {
        if (err) return res.send('Error deleting student');
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
