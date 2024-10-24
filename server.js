import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import Users from './models/User.js';
import Orders from './models/Orders.js';
import './db.js';

config();

const app = express();
app.use(json(), cors());

const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send('<h1>Server is Running!</h1>');
});

// Fetching All users with optional pagination (skip and limit)
app.get('/api/v1/users', async (req, res) => {
  const { skip = 0, limit = 10 } = req.query;

  try {
    const users = await Users.findAll({
      offset: parseInt(skip),
      limit: parseInt(limit),
    });

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Fetching all users with their orders
app.get('/api/v1/users/orders', async (req, res) => {
  try {
    const usersWithOrders = await Users.findAll({
      include: [
        {
          model: Orders,
          as: 'Orders',
        },
      ],
    });
    res.json(usersWithOrders);
  } catch (err) {
    console.error('Error fetching users with orders:', err);
    res.status(500).json({ error: 'Failed to fetch users with orders' });
  }
});

// Get a single user by ID
app.get('/api/v1/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const user = await Users.findByPk(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create a new user
app.post('/api/v1/users', async (req, res) => {
  const { first_name, last_name, age } = req.body;
  try {
    const newUser = await Users.create({ first_name, last_name, age });
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update an existing user
app.put('/api/v1/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { first_name, last_name, age } = req.body;
  try {
    const user = await Users.findByPk(id);
    if (user) {
      await user.update({ first_name, last_name, age });
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
app.delete('/api/v1/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const user = await Users.findByPk(id);
    if (user) {
      await user.destroy();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('*', (req, res) => {
  res.status(500).send('Server error!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
