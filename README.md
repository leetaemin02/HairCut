# Haircut Appointment Scheduling System with QR Code Scanning

A full-stack web application for booking and managing haircut appointments with QR code scanning functionality.

## 🚀 Features

- **User Authentication**: Secure registration and login for customers and barbers
- **Appointment Booking**: Customers can book appointments with barbers
- **Service Management**: Admin can manage services (haircuts, styles, etc.)
- **QR Code Generation**: Each appointment generates a unique QR code
- **QR Code Scanning**: Barbers can scan QR codes to confirm appointments
- **Appointment Management**: View, update, and cancel appointments
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📋 System Architecture

### Backend (Node.js + Express)

- REST API with JWT authentication
- MongoDB database for data persistence
- QR code generation using `qrcode` library
- Role-based access control (customer, barber, admin)

### Frontend (React)

- Responsive UI with modern design
- QR code scanner using `jsQR` library
- Real-time appointment management
- User authentication and profile management

## 🔧 Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **qrcode** - QR code generation
- **CORS** - Cross-Origin Resource Sharing

### Frontend

- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **qrcode.react** - QR code display
- **jsQR** - QR code scanning

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/haircut-appointments
PORT=5000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

4. Start the server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🗄️ Database Models

### User Model

```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (customer|barber|admin),
  address: String,
  profileImage: String,
  isActive: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Appointment Model

```javascript
{
  appointmentId: String (unique),
  customerId: ObjectId (ref: User),
  barberId: ObjectId (ref: User),
  serviceId: ObjectId (ref: Service),
  appointmentDate: DateTime,
  duration: Number (minutes),
  status: String (pending|confirmed|completed|cancelled),
  notes: String,
  qrCode: String (base64),
  totalPrice: Number,
  paymentStatus: String (pending|paid|cancelled),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Service Model

```javascript
{
  name: String,
  description: String,
  price: Number,
  duration: Number (minutes),
  image: String,
  isActive: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### QRCode Model

```javascript
{
  appointmentId: ObjectId (ref: Appointment),
  code: String (unique),
  scannedAt: DateTime,
  isScanned: Boolean,
  scannedBy: ObjectId (ref: User),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## 🔌 API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Appointment Endpoints

- `POST /api/appointments` - Create appointment (requires auth)
- `GET /api/appointments` - Get user's appointments (requires auth)
- `GET /api/appointments/:id` - Get appointment details (requires auth)
- `PUT /api/appointments/:id` - Update appointment (requires auth)
- `DELETE /api/appointments/:id` - Cancel appointment (requires auth)
- `POST /api/appointments/scan-qr` - Scan QR code (requires barber role)

### Service Endpoints

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (requires admin role)
- `PUT /api/services/:id` - Update service (requires admin role)
- `DELETE /api/services/:id` - Delete service (requires admin role)

## 🎯 How to Use

### For Customers

1. Register an account as a "Customer"
2. Log in to the dashboard
3. Click "Book Appointment"
4. Select a service, barber, and appointment time
5. Download the QR code for your appointment
6. Show the QR code to the barber on your appointment date

### For Barbers

1. Register an account as a "Barber"
2. Log in to the dashboard
3. Go to QR Code Scanner page
4. Scan the customer's QR code
5. Appointment status updates to "Confirmed"

### For Admins

1. Register an account as an "Admin"
2. Manage services through the admin panel
3. View all appointments and user management

## 🔐 Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for different user roles
- **CORS**: Configured to allow cross-origin requests safely
- **Environment Variables**: Sensitive data stored in .env files

## 📱 Frontend Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard (appointments & booking)
- `/scanner` - QR code scanner for barbers
- `/` - Redirects to dashboard

## 🚦 Running the Application

### Development Mode

Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:

```bash
cd frontend
npm start
```

### Production Build

Frontend:

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` folder.

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running locally or have a valid MongoDB Atlas URI
- Check the connection string in `.env` file

### CORS Errors

- Ensure backend is running on `http://localhost:5000`
- Check the proxy setting in `frontend/package.json`

### Port Already in Use

- Change the PORT in `.env` for backend
- For frontend, use: `PORT=3001 npm start`

### QR Scanner Not Working

- Ensure you have granted camera permissions
- Test on HTTPS in production (some browsers require it)
- Check browser console for errors

## 📝 Environment Variables

Backend (.env):

```env
MONGODB_URI=mongodb://localhost:27017/haircut-appointments
PORT=5000
JWT_SECRET=your_secret_key_change_this
NODE_ENV=development
```

Frontend (.env):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💼 Author

Created for Intern Project

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [JWT Authentication](https://jwt.io/)
- [QR Code Generation](https://www.npmjs.com/package/qrcode)

## 📞 Support

For issues and questions, please open an issue in the project repository.
