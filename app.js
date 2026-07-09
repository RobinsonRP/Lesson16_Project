const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const app = express();

// Middleware for parsing form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, 'public/images'); // Directory to save uploaded files
},
filename: (req, file, cb) => {
cb(null, file.originalname); 
}
});
const upload = multer({ storage: storage });



// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'RP738964$',
    database: 'c237_supermarketapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM products';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving products');
    }
    res.render('index', { products: results });
  });
});

app.get('/addProduct', (req, res) => {
  res.render('addProduct');
});

app.post('/addProduct', upload.single('image'), (req, res) => {
    const { name, quantity, price } = req.body;
    const image = req.file.filename;

    const sql = `
        INSERT INTO products (productName, quantity, price, image)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(sql, [name, quantity, price, image], (error) => {
        if (error) {
            console.error("Error adding product:", error);
            return res.send("Error adding product");
        }

        res.redirect('/');
    });
});

app.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE productId = ?';
  connection.query(sql, [productId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving product by ID');
    }
    if (results.length > 0) {
      res.render('product', { product: results[0] });
    } else {
      res.send('Product not found');
    }
  });
});

app.get('/editProduct/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE productId = ?';
  connection.query(sql, [productId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error retrieving product by ID');
    }
    if (results.length > 0) {
      res.render('editProduct', { product: results[0] });
    } else {
      res.send('Product not found');
    }
  });
});

app.post('/editProduct/:id', upload.single('image'), (req, res) => {
  const productId = req.params.id;
  const { name, quantity, price } = req.body;
  let image = req.file ? req.file.filename : null;
  const sql = 'UPDATE products SET productName = ?, quantity = ?, price = ?, image = ? WHERE productId = ?';
  connection.query(sql, [name, quantity, price, image, productId], (error) => {
    if (error) {
      console.error("Error updating product:", error);
      return res.send('Error updating product');
    }
    res.redirect('/');
  });
});

app.get('/deleteProduct/:id', (req, res) => {
  const productId = req.params.id;   const sql = 'DELETE FROM products WHERE productId = ?';   
  connection.query( sql , [productId], (error, results) => {     if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error deleting product:", error);       
      res.send('Error deleting product');
    } else {
      // Send a success response       
    res.redirect('/');
    }
  }); 
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
