# Quick Start Guide - Haircut Appointment System

## 🚀 Get Started in 5 Minutes

### Step 1: Clone/Navigate to Project

```bash
cd Intern-Project
```

### Step 2: Setup Backend

**Terminal 1:**

```bash
cd backend
npm install
npm run dev
```

Wait for: `Server running on port 5000`

### Step 3: Setup Frontend

**Terminal 2:**

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

### Step 4: Test the Application

1. **Register as a Customer:**

   - Go to `/register`
   - Fill in the form (select "Customer")
   - Click Register

2. **Book an Appointment:**

   - Click "Book Appointment" button
   - Select a service
   - Enter barber ID: `507f1f77bcf86cd799439011`
   - Select date and time
   - Click "Book Appointment"

3. **View QR Code:**

   - You'll see your appointment card with QR code
   - Click "Download QR" to save it

4. **Test QR Scanner (as Barber):**
   - Register as a "Barber"
   - Go to `/scanner`
   - Click "Start Scanning"
   - Point camera at QR code
   - See appointment confirmed!

## 🗄️ Database Setup

Before running, ensure MongoDB is set up:

### Option 1: Local MongoDB

```bash
# Windows: MongoDB should be installed
# Start MongoDB service or use MongoDB Compass
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster and get connection string
3. Update `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/haircut-appointments
```

## 📱 Key Features to Try

### Customer Features

- ✅ Register and login
- ✅ Book appointments
- ✅ View appointments
- ✅ Download QR codes
- ✅ Cancel appointments

### Barber Features

- ✅ Scan customer QR codes
- ✅ Confirm appointments
- ✅ View customer details

### Admin Features

- ✅ Manage services
- ✅ View all appointments
- ✅ Manage users

## 🎨 Default Services (Add via API)

```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Basic Haircut",
    "description": "Standard haircut",
    "price": 25,
    "duration": 30
  }'
```

## 🔗 API Documentation

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Appointments

- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - View my appointments
- `POST /api/appointments/scan-qr` - Scan QR code

### Services

- `GET /api/services` - View all services

## 🛠️ Troubleshooting

| Issue                    | Solution                                |
| ------------------------ | --------------------------------------- |
| Can't connect to backend | Ensure backend is running on port 5000  |
| MongoDB error            | Install MongoDB or use Atlas connection |
| QR scanner not working   | Allow camera permissions                |
| Port 3000 in use         | Use `PORT=3001 npm start`               |
| Port 5000 in use         | Change PORT in backend/.env             |

## 📂 Project Structure

```
Intern-Project/
├── backend/              # Node.js API
│   ├── models/          # Database schemas
│   ├── controllers/      # Business logic
│   ├── routes/          # API routes
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/            # React app
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   ├── styles/      # CSS files
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🎯 Next Steps

1. ✅ Start the application
2. ✅ Create test accounts
3. ✅ Book an appointment
4. ✅ Test QR scanner
5. 📝 Customize services in database
6. 🎨 Modify styling (src/styles/)
7. 📊 Add more features
8. 🚀 Deploy to production

## 🆘 Need Help?

Check these files for detailed setup:

- `backend/SETUP.md` - Backend configuration
- `frontend/SETUP.md` - Frontend configuration
- `README.md` - Full documentation

## 💡 Demo Credentials (After First Registration)

After registering, use your credentials:

- Email: your_email@example.com
- Password: your_password

## 🎓 Learn More

- Backend API: http://localhost:5000/api/health
- Frontend App: http://localhost:3000
- React Docs: https://react.dev
- Express Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com

---

**Happy coding! 🎉**
