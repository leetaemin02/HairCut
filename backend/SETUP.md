# Backend Setup Guide

## Prerequisites

- Node.js v14 or higher
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/haircut-appointments

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (change this in production!)
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

### 3. MongoDB Setup

#### Local MongoDB Installation

```bash
# On Windows, MongoDB should be installed from https://www.mongodb.com/try/download/community
# Start MongoDB service:
net start MongoDB

# Or use MongoDB Compass for GUI management
```

#### MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update MONGODB_URI in .env

Example MongoDB Atlas URI:

```
mongodb+srv://username:password@cluster.mongodb.net/haircut-appointments?retryWrites=true&w=majority
```

### 4. Start the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will be available at `http://localhost:5000`

## Testing the API

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123",
    "role": "customer"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Database Seeding

To seed initial data, create a `seed.js` file:

```javascript
const mongoose = require("mongoose");
const Service = require("./models/Service");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);

const seedServices = async () => {
  try {
    await Service.deleteMany({});

    const services = [
      {
        name: "Basic Haircut",
        description: "Standard haircut and styling",
        price: 25,
        duration: 30,
      },
      {
        name: "Fade Cut",
        description: "Modern fade haircut",
        price: 35,
        duration: 40,
      },
      {
        name: "Beard Trim",
        description: "Professional beard trimming",
        price: 15,
        duration: 20,
      },
    ];

    await Service.insertMany(services);
    console.log("Services seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedServices();
```

Run: `node seed.js`

## Project Structure

```
backend/
├── models/
│   ├── User.js
│   ├── Appointment.js
│   ├── Service.js
│   └── QRCode.js
├── controllers/
│   ├── authController.js
│   ├── appointmentController.js
│   └── serviceController.js
├── routes/
│   ├── authRoutes.js
│   ├── appointmentRoutes.js
│   └── serviceRoutes.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
├── .env
└── .gitignore
```

## Important Files

- `server.js` - Main entry point
- `.env` - Environment variables (not version controlled)
- `package.json` - Dependencies and scripts

## Common Issues

### MongoDB Connection Error

- Ensure MongoDB service is running
- Check MONGODB_URI in .env file
- Verify network access if using MongoDB Atlas

### Port Already in Use

- Change PORT in .env
- Or kill the process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

### Nodemon Not Working

- Install globally: `npm install -g nodemon`
- Or use: `npx nodemon server.js`

## Next Steps

1. Set up the frontend (see ../frontend/README.md)
2. Configure MongoDB for production
3. Update JWT_SECRET for production
4. Deploy to a hosting service (Heroku, AWS, etc.)
