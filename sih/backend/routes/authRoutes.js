const express = require('express');
const router = express.Router();
console.log('🔥 AUTH ROUTES FILE LOADED');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });
  
  const tokenString = token.split(' ')[1] || token;
  jwt.verify(tokenString, process.env.JWT_SECRET || 'your_jwt_secret_key_here', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role: role || 'PUBLIC_USER'
        }
      ])
      .select()
      .single();
      
    if (insertError) throw insertError;
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration', details: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('🔥 LOGIN ROUTE HIT');
  try {
    const { email, password } = req.body;
    
    // Find user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
      console.log('SUPABASE TEST:', {
  email,
  userFound: !!user,
  findError: findError
    ? {
        message: findError.message,
        code: findError.code,
        details: findError.details
      }
    : null
});
      
    if (findError || !user) return res.status(404).json({ error: 'User not found' });
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
    
    // Create and assign token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login', details: error.message });
  }
});

// @route GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, age_group, preferred_language, role, preferences, notification_enabled')
      .eq('id', req.userId)
      .single();
      
    if (error || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
console.log(
  '🔥 REGISTERED ROUTES:',
  router.stack
    .filter(layer => layer.route)
    .map(layer => ({
      path: layer.route.path,
      methods: layer.route.methods
    }))
);
module.exports = router;
module.exports.verifyToken = verifyToken; // Export middleware for other routes
