const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3001;

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

app.use(express.json());

// Get all users
app.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something broke 💩');
  }
});

// Get user by id
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.send(rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Something broke 💩');
  }
});

// Create a new user
app.post("/users", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const [result] = await pool.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, password]);
    const id = result.insertId;
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    res.status(201).send(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something broke 💩');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke 💩');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
