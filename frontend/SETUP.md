# Frontend Setup Guide

## Prerequisites

- Node.js v14 or higher
- npm or yarn
- Backend API running on `http://localhost:5000`

## Installation Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory (optional):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

By default, the app will use `http://localhost:5000/api` if this is not set.

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

### Development

```bash
npm start
```

Runs the app in development mode with hot reload.

### Build

```bash
npm run build
```

Creates an optimized production build in the `build` folder.

### Test

```bash
npm test
```

Runs the test suite (if available).

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   └── QRScanner.js
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   └── qr-scanner.css
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── .gitignore
```

## Key Features

### Authentication Pages

- **Login** (`/login`) - User login
- **Register** (`/register`) - New user registration

### Main Pages

- **Dashboard** (`/dashboard`) - Appointment management
- **QR Scanner** (`/scanner`) - QR code scanning for barbers

## API Integration

The app uses Axios for API calls. All API requests are configured in `src/services/api.js`:

```javascript
// Example API calls
import { authAPI, appointmentAPI, serviceAPI } from "./services/api";

// Login
const response = await authAPI.login({ email, password });

// Book appointment
const response = await appointmentAPI.createAppointment(data);

// Scan QR code
const response = await appointmentAPI.scanQRCode({ appointmentCode });
```

## Components

### Login Component

- Email and password input
- Error handling
- Redirect to dashboard on success

### Register Component

- Full name, email, phone, password inputs
- User role selection (Customer/Barber)
- Input validation

### Dashboard Component

- View all appointments
- Book new appointments
- Display QR codes
- Download appointment QR codes

### QR Scanner Component

- Real-time QR code scanning
- Camera access
- Appointment confirmation on scan

## Styling

The app uses CSS files for styling with a modern purple gradient theme:

- Primary color: #667eea
- Secondary color: #764ba2

All styles are contained in `src/styles/` directory.

## Common Issues

### Backend Connection Error

- Ensure backend is running on `http://localhost:5000`
- Check console for error messages
- Verify API URL in `.env` or `src/services/api.js`

### QR Scanner Not Working

- Allow camera permissions when prompted
- Test on HTTPS in production
- Check browser compatibility (requires media devices API)

### Build Issues

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Delete build folder: `rm -rf build`

## Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Build: `npm run build`
2. Connect to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`

### Environment Variables for Production

Update `.env` with production API URL:

```env
REACT_APP_API_URL=https://your-api-url.com/api
```

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance Optimization

- Code splitting with React Router
- Lazy loading components
- CSS optimization
- Image optimization

## Security

- JWT tokens stored in localStorage
- CORS handling via backend
- XSS protection through React
- CSRF protection recommended for production

## Next Steps

1. Customize branding and colors
2. Add more services and features
3. Implement payment integration
4. Add email notifications
5. Deploy to production

## Support

For issues:

1. Check browser console (F12)
2. Check backend API logs
3. Verify network requests in DevTools
4. Check GitHub issues (if applicable)
