import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = 1025;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Allow multiple ports
  credentials: true
}));

// Dummy authentication data
const dummyUsers = [
  { email: 'admin@example.com', password: 'password', type: 'manager' },
  { email: 'user@example.com', password: 'password', type: 'user' }
];

// Login endpoint
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = dummyUsers.find(u => u.email === email && u.password === password);

  if (user) {
    // Set a cookie for authentication
    res.cookie('auth_token', 'dummy_token', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: { agent: { type: user.type } }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid email or password'
  });
});

// Auth check endpoint
app.get('/auth/check', (req, res) => {
  const { agentType } = req.query;
  const authToken = req.cookies.auth_token;

  if (authToken === 'dummy_token') {
    return res.json({
      success: true,
      data: {
        agent: {
          type: agentType || 'manager'  // Return the requested agent type
        }
      }
    });
  }

  return res.json({
    error: 'Not authenticated'
  });
});

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

app.listen(port, () => {
  console.log(`Dummy server running at http://localhost:${port}`);
});