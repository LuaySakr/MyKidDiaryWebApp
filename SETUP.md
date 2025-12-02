# Setup Guide for MyKidDiary

This guide will walk you through setting up the MyKidDiary application on your local machine.

## Prerequisites

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v4.4 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Verify installation: `mongod --version`

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/LuaySakr/MyKidDiaryWebApp.git
cd MyKidDiaryWebApp
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express (web framework)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- express-validator (input validation)
- express-rate-limit (rate limiting)
- cors (CORS middleware)
- dotenv (environment variables)

### 3. Setup MongoDB

#### Option A: Local MongoDB Installation

1. **Install MongoDB** following the official guide for your OS:
   - macOS: `brew tap mongodb/brew && brew install mongodb-community`
   - Ubuntu: Follow https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
   - Windows: Download installer from MongoDB website

2. **Start MongoDB service**:
   ```bash
   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows (usually runs automatically)
   net start MongoDB
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   # You should see MongoDB shell prompt
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Click "Connect" and get your connection string
4. Use this connection string in your `.env` file

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your settings:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/mykiddiary
   JWT_SECRET=your-very-long-random-secret-key-here
   ```

   **Important:** 
   - For production, generate a strong random JWT secret: 
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - If using MongoDB Atlas, replace MONGODB_URI with your Atlas connection string

### 5. Start the Application

#### Development Mode (with auto-restart on file changes)
```bash
npm run dev
```

Note: This requires `nodemon` to be installed globally:
```bash
npm install -g nodemon
```

#### Production Mode
```bash
npm start
```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the MyKidDiary landing page!

## Testing the Application

### 1. Create an Account
1. Click "Get Started" or "Sign Up"
2. Enter username (min 3 characters)
3. Enter valid email
4. Enter password (min 6 characters)
5. Click "Sign Up"

### 2. Write Your First Diary Entry
1. Click "Write Secret" in the navigation
2. Enter a title and content
3. Choose privacy level:
   - **Only Me**: Completely private
   - **My Followers**: Visible to followers only
   - **Specific People**: Share with selected users
   - **Everyone**: Public post
4. Click "Save"

### 3. Find and Follow Friends
1. Click "Profile"
2. Scroll to "Find Friends"
3. Search for usernames
4. Click "Follow" to follow other users

### 4. View Your Feed
1. Click "Feed" to see posts from people you follow and public posts
2. Click "My Diary" to see all your posts
3. Edit or delete your posts as needed

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change the PORT in `.env` file or kill the process using port 3000
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

### JWT Secret Error
```
Error: secretOrPrivateKey must have a value
```
**Solution**: Make sure you have set JWT_SECRET in your `.env` file

## API Testing with curl

You can test the API endpoints using curl:

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Create a Post (requires auth token)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Secret",
    "content": "This is my secret diary entry",
    "privacy": "private"
  }'
```

## Security Notes

- Never commit your `.env` file to version control
- Change the default JWT_SECRET in production
- Use strong passwords
- The app includes rate limiting:
  - 100 requests per 15 minutes for general API
  - 5 authentication attempts per 15 minutes
- All passwords are hashed using bcrypt with salt
- Input validation is enabled on all routes

## Development Tips

- Use MongoDB Compass for visual database management
- Install Postman for API testing
- Check server logs for debugging
- Use browser DevTools to debug frontend issues

## Need Help?

- Check the main README.md for more information
- Review the API documentation in README.md
- Open an issue on GitHub if you encounter problems

---

Happy Diary Writing! 📝✨
