const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Database connection config
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'buggy_db',
  port: 3306,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database');
  }
});

// Get all users
app.get('/users', (req, res) => {
  const sql = 'SELECT user_id, name, email FROM users';

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Create a new order
app.post('/orders', (req, res) => {
  const { user_id, order_total } = req.body;

  if (!user_id || !order_total) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Use parameterized query to prevent SQL injection
  const sql = 'INSERT INTO orders (user_id, order_total) VALUES (?, ?)';

  db.query(sql, [user_id, order_total], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Order created', order_id: result.insertId });
  });
});

// Get orders by user ID
app.get('/users/:id/orders', (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT o.order_id, o.order_total, u.name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    WHERE o.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Update user by ID
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  const sql = 'UPDATE users SET name = ?, email = ? WHERE user_id = ?';

  db.query(sql, [name, email, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User updated' });
  });
});

// Delete user by ID
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;

  const sql = 'DELETE FROM users WHERE user_id = ?';

  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User deleted' });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
