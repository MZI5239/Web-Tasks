const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/loginapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization || req.query.token || req.body.token;
  
  if (!token) {
    return res.status(401).redirect('/?error=Access denied. Please login.');
  }
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'your-jwt-secret-key-2026');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).redirect('/?error=Invalid token. Please login again.');
  }
};

// Routes

// Home/Login page
app.get('/', (req, res) => {
  const error = req.query.error || null;
  const success = req.query.success || null;
  res.render('login', { error, success });
});

// Login POST
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.redirect('/?error=Please provide username and password');
    }
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect('/?error=Invalid username or password');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.redirect('/?error=Invalid username or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role 
      }, 
      'your-jwt-secret-key-2026',
      { expiresIn: '24h' }
    );
    
    console.log(`✅ User ${username} logged in successfully`);
    res.redirect(`/dashboard?token=${token}`);
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/?error=Server error during login');
  }
});

// Register POST
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.redirect('/?error=Please fill in all fields');
    }

    if (password.length < 6) {
      return res.redirect('/?error=Password must be at least 6 characters long');
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.redirect('/?error=Username or email already exists');
    }
    
    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    
    console.log(`✅ New user registered: ${username}`);
    res.redirect('/?success=Registration successful! Please login with your credentials.');
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      res.redirect('/?error=Username or email already exists');
    } else {
      res.redirect('/?error=Registration failed. Please try again.');
    }
  }
});

// Dashboard - Read all users (Protected route)
app.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    const currentUser = await User.findById(req.userId).select('-password');
    
    res.render('dashboard', { 
      users, 
      currentUser, 
      token: req.query.token || req.body.token,
      message: req.query.message || null
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).redirect('/?error=Error loading dashboard');
  }
});

// Create user (POST /users)
app.post('/users', verifyToken, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const token = req.query.token || req.body.token;
    
    if (!username || !email || !password) {
      return res.redirect(`/dashboard?token=${token}&message=Please fill in all fields`);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.redirect(`/dashboard?token=${token}&message=Username or email already exists`);
    }
    
    const user = new User({ 
      username, 
      email, 
      password,
      role: role || 'user'
    });
    await user.save();
    
    console.log(`✅ New user created: ${username}`);
    res.redirect(`/dashboard?token=${token}&message=User created successfully`);
  } catch (error) {
    console.error('Create user error:', error);
    const token = req.query.token || req.body.token;
    res.redirect(`/dashboard?token=${token}&message=Error creating user`);
  }
});

// Update user (POST /users/:id)
app.post('/users/:id', verifyToken, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const token = req.query.token || req.body.token;
    
    if (!username || !email) {
      return res.redirect(`/dashboard?token=${token}&message=Username and email are required`);
    }

    // Check if username/email already exists for other users
    const existingUser = await User.findOne({ 
      $and: [
        { _id: { $ne: req.params.id } },
        { $or: [{ username }, { email }] }
      ]
    });
    
    if (existingUser) {
      return res.redirect(`/dashboard?token=${token}&message=Username or email already exists`);
    }
    
    await User.findByIdAndUpdate(req.params.id, { 
      username, 
      email,
      role: role || 'user'
    });
    
    console.log(`✅ User updated: ${username}`);
    res.redirect(`/dashboard?token=${token}&message=User updated successfully`);
  } catch (error) {
    console.error('Update user error:', error);
    const token = req.query.token || req.body.token;
    res.redirect(`/dashboard?token=${token}&message=Error updating user`);
  }
});

// Delete user (GET /users/:id/delete)
app.get('/users/:id/delete', verifyToken, async (req, res) => {
  try {
    const token = req.query.token;
    const userToDelete = await User.findById(req.params.id);
    
    if (!userToDelete) {
      return res.redirect(`/dashboard?token=${token}&message=User not found`);
    }

    // Prevent users from deleting themselves
    if (req.params.id === req.userId) {
      return res.redirect(`/dashboard?token=${token}&message=You cannot delete your own account`);
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    console.log(`✅ User deleted: ${userToDelete.username}`);
    res.redirect(`/dashboard?token=${token}&message=User deleted successfully`);
  } catch (error) {
    console.error('Delete user error:', error);
    const token = req.query.token;
    res.redirect(`/dashboard?token=${token}&message=Error deleting user`);
  }
});

// Get user details for editing (API endpoint)
app.get('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  console.log('✅ User logged out');
  res.redirect('/?success=Logged out successfully');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).redirect('/?error=Internal server error');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 MongoDB database: loginapp`);
  console.log(`👤 Access the application at http://localhost:${PORT}`);
});
