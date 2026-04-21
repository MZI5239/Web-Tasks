# MongoDB Express Login & CRUD Application

This is a complete Express.js application with MongoDB integration that includes user authentication and CRUD operations.

## 🚀 Features

- **User Authentication**: Login and Registration with JWT tokens
- **Password Security**: Bcrypt password hashing
- **CRUD Operations**: Create, Read, Update, Delete users
- **Role Management**: User and Admin roles
- **Responsive UI**: Modern, mobile-friendly interface
- **Protected Routes**: JWT token verification middleware

## 📋 Prerequisites

Before running this application, make sure you have installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS version

2. **MongoDB** (Community Edition)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud database)

## 🛠️ Installation & Setup

### Step 1: Install Node.js
1. Go to https://nodejs.org/
2. Download and install the LTS version
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install MongoDB
1. Download MongoDB Community Edition
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017`

### Step 3: Install Dependencies
Navigate to the project directory and run:
```bash
npm install
```

### Step 4: Start the Application
```bash
npm start
```
Or for development with auto-restart:
```bash
npm run dev
```

## 🌐 Usage

1. **Access the Application**
   - Open browser and go to: http://localhost:3000

2. **Register a New User**
   - Click on "Register" tab
   - Fill in username, email, and password
   - Click "Register"

3. **Login**
   - Use your credentials to login
   - You'll be redirected to the dashboard

4. **Dashboard Features**
   - View all registered users
   - Add new users
   - Edit existing users
   - Delete users (except yourself)
   - See user statistics

## 📁 Project Structure

```
task3/
├── login.js           # Main Express server file
├── package.json       # Node.js dependencies
├── views/
│   ├── login.ejs     # Login & Registration page
│   └── dashboard.ejs # User management dashboard
└── README.md         # This file
```

## 🔐 API Endpoints

### Authentication
- `GET /` - Login/Register page
- `POST /login` - User login
- `POST /register` - User registration
- `GET /logout` - User logout

### User Management (Protected)
- `GET /dashboard` - User dashboard
- `POST /users` - Create new user
- `POST /users/:id` - Update user
- `GET /users/:id/delete` - Delete user
- `GET /api/users/:id` - Get user details (API)

## 🔧 Configuration

### Database Configuration
The application connects to MongoDB at:
```javascript
mongodb://localhost:27017/loginapp
```

### JWT Secret
Default JWT secret key: `your-jwt-secret-key-2026`

**⚠️ Important**: In production, use environment variables for sensitive data!

## 🛡️ Security Features

- Password hashing with bcrypt (salt rounds: 12)
- JWT token authentication
- Protected routes middleware
- Input validation
- Unique username and email constraints
- XSS protection in templates

## 📱 UI Features

- Modern, responsive design
- Gradient backgrounds and animations
- Modal dialogs for user operations
- Mobile-friendly interface
- Loading states and transitions
- Form validation feedback

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (macOS/Linux)
sudo systemctl start mongod
```

### Port Already in Use
Change the port in login.js:
```javascript
const PORT = process.env.PORT || 3001; // Change from 3000 to 3001
```

### Node.js Not Found
Make sure Node.js is installed and added to your system PATH.

## 🚀 Next Steps

1. Install Node.js and MongoDB
2. Run `npm install` to install dependencies
3. Start MongoDB service
4. Run `npm start` to launch the application
5. Open http://localhost:3000 in your browser

## 🎉 You're Ready!

Your MongoDB Express application with login and CRUD operations is now set up and ready to use!