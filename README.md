# MyKidDiary - Personal Secret Diary Web App

A modern, secure diary web application for teenagers to write and share their secrets with complete privacy controls. Built with love by Aseel's idea! 💜

## Features

✨ **Privacy-First Design**
- Multiple privacy levels: Private, Followers only, Specific users, or Public
- Secure user authentication with JWT tokens
- Password encryption using bcrypt

🔐 **User Authentication**
- Secure registration and login system
- Session management with JWT tokens
- Protected API endpoints

📝 **Diary Entries**
- Create, read, update, and delete diary posts
- Rich text content support
- Privacy controls for each post
- Share specific posts with specific users

👥 **Social Features**
- Follow and unfollow other users
- View posts from users you follow
- Search for users to connect with
- View follower/following counts

🎨 **Beautiful UI**
- Responsive design that works on all devices
- Modern gradient background
- Clean and intuitive interface
- Smooth animations and transitions

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- Vanilla JavaScript
- HTML5
- CSS3 with modern features

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/LuaySakr/MyKidDiaryWebApp.git
cd MyKidDiaryWebApp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mykiddiary
JWT_SECRET=your-very-long-random-secret-key-here
```

5. Make sure MongoDB is running on your system:
```bash
# On macOS (if installed via Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
# MongoDB should start automatically as a service
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/follow/:userId` - Follow a user (protected)
- `DELETE /api/auth/follow/:userId` - Unfollow a user (protected)
- `GET /api/auth/search` - Search users (protected)

### Posts
- `POST /api/posts` - Create a new post (protected)
- `GET /api/posts` - Get all accessible posts (protected)
- `GET /api/posts/my-posts` - Get user's own posts (protected)
- `GET /api/posts/:postId` - Get a specific post (protected)
- `PUT /api/posts/:postId` - Update a post (protected)
- `DELETE /api/posts/:postId` - Delete a post (protected)

## Privacy Levels

1. **Private**: Only you can see the post
2. **Followers**: Only your followers can see the post
3. **Specific**: Only specific users you select can see the post
4. **Public**: Everyone can see the post

## Security Features

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens for secure authentication
- Input validation and sanitization
- Protected API endpoints
- XSS protection through HTML escaping
- Secure password requirements (minimum 6 characters)

## Project Structure

```
MyKidDiaryWebApp/
├── public/                 # Frontend files
│   ├── css/
│   │   └── style.css      # Styles
│   ├── js/
│   │   └── app.js         # Frontend JavaScript
│   └── index.html         # Main HTML file
├── src/
│   ├── config/            # Configuration files
│   │   └── database.js    # MongoDB connection
│   ├── controllers/       # Request handlers
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/        # Custom middleware
│   │   └── auth.js        # Authentication middleware
│   ├── models/            # Database models
│   │   ├── User.js
│   │   └── Post.js
│   └── routes/            # API routes
│       ├── auth.js
│       └── posts.js
├── .env.example           # Example environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
├── README.md             # This file
└── server.js             # Main server file
```

## Contributing

This is a personal project inspired by Aseel's idea. If you'd like to contribute or have suggestions, feel free to open an issue or submit a pull request!

## License

ISC

## Acknowledgments

- Inspired by Aseel's creative idea to create a safe space for teenagers to express themselves
- Built with modern web technologies and security best practices

---

Made with ❤️ for teenagers who want to express themselves safely