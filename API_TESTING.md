# API Testing Guide

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. AUTHENTICATION ENDPOINTS

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "customer"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### Get Profile

```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "role": "customer",
  "address": "123 Main St",
  "profileImage": null,
  "isActive": true,
  "createdAt": "2024-01-06T10:30:00Z",
  "updatedAt": "2024-01-06T10:30:00Z"
}
```

#### Update Profile

```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "0987654321",
  "address": "456 Oak Ave"
}
```

### 2. SERVICE ENDPOINTS

#### Get All Services

```http
GET /services
```

**Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Basic Haircut",
    "description": "Standard haircut and styling",
    "price": 25,
    "duration": 30,
    "image": null,
    "isActive": true,
    "createdAt": "2024-01-06T10:00:00Z",
    "updatedAt": "2024-01-06T10:00:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Fade Cut",
    "description": "Modern fade haircut",
    "price": 35,
    "duration": 40,
    "image": null,
    "isActive": true,
    "createdAt": "2024-01-06T10:00:00Z",
    "updatedAt": "2024-01-06T10:00:00Z"
  }
]
```

#### Get Service by ID

```http
GET /services/507f1f77bcf86cd799439012
```

#### Create Service (Admin Only)

```http
POST /services
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Premium Haircut",
  "description": "Luxury haircut with styling",
  "price": 50,
  "duration": 45
}
```

#### Update Service (Admin Only)

```http
PUT /services/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 30,
  "duration": 35
}
```

#### Delete Service (Admin Only)

```http
DELETE /services/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>
```

### 3. APPOINTMENT ENDPOINTS

#### Create Appointment

```http
POST /appointments
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "barberId": "507f1f77bcf86cd799439014",
  "serviceId": "507f1f77bcf86cd799439012",
  "appointmentDate": "2024-01-15T14:30:00Z",
  "notes": "Please give a fade cut"
}
```

**Response:**

```json
{
  "message": "Appointment created successfully",
  "appointment": {
    "_id": "507f1f77bcf86cd799439015",
    "appointmentId": "APT-1704542400000",
    "customerId": "507f1f77bcf86cd799439011",
    "barberId": "507f1f77bcf86cd799439014",
    "serviceId": "507f1f77bcf86cd799439012",
    "appointmentDate": "2024-01-15T14:30:00Z",
    "duration": 30,
    "status": "pending",
    "notes": "Please give a fade cut",
    "qrCode": "data:image/png;base64,...",
    "totalPrice": 25,
    "paymentStatus": "pending",
    "createdAt": "2024-01-06T10:30:00Z",
    "updatedAt": "2024-01-06T10:30:00Z"
  }
}
```

#### Get All My Appointments

```http
GET /appointments
Authorization: Bearer <token>
```

#### Get Appointment by ID

```http
GET /appointments/507f1f77bcf86cd799439015
Authorization: Bearer <token>
```

#### Update Appointment

```http
PUT /appointments/507f1f77bcf86cd799439015
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

#### Cancel Appointment

```http
DELETE /appointments/507f1f77bcf86cd799439015
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Appointment cancelled successfully",
  "appointment": {
    "_id": "507f1f77bcf86cd799439015",
    "status": "cancelled",
    ...
  }
}
```

#### Scan QR Code (Barber Only)

```http
POST /appointments/scan-qr
Authorization: Bearer <barber_token>
Content-Type: application/json

{
  "appointmentCode": "APT-1704542400000"
}
```

**Response:**

```json
{
  "message": "QR code scanned successfully",
  "appointment": {
    "_id": "507f1f77bcf86cd799439015",
    "status": "confirmed",
    "customerId": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    ...
  }
}
```

### 4. HEALTH CHECK

#### Server Health

```http
GET /health
```

**Response:**

```json
{
  "status": "Server is running"
}
```

## Error Responses

### Unauthorized

```json
{
  "message": "No token provided"
}
```

Status: 401

### Forbidden (Insufficient Permissions)

```json
{
  "message": "Access denied"
}
```

Status: 403

### Not Found

```json
{
  "message": "Appointment not found"
}
```

Status: 404

### Bad Request

```json
{
  "message": "User already exists"
}
```

Status: 400

### Server Error

```json
{
  "message": "Something went wrong!"
}
```

Status: 500

## Using Postman/curl Examples

### Register a Customer

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

### Get Services

```bash
curl -X GET http://localhost:5000/api/services
```

### Book an Appointment

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "barberId": "507f1f77bcf86cd799439014",
    "serviceId": "507f1f77bcf86cd799439012",
    "appointmentDate": "2024-01-15T14:30:00Z",
    "notes": "Please give a fade cut"
  }'
```

### Scan QR Code

```bash
curl -X POST http://localhost:5000/api/appointments/scan-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BARBER_TOKEN" \
  -d '{
    "appointmentCode": "APT-1704542400000"
  }'
```

## Testing Workflow

1. **Create test accounts:**

   - Register as Customer
   - Register as Barber
   - Register as Admin

2. **Create services (as Admin):**

   - POST /services with service details

3. **Book appointment (as Customer):**

   - POST /appointments with barber and service IDs

4. **Scan QR code (as Barber):**

   - POST /appointments/scan-qr with appointment code

5. **Verify appointment status:**
   - GET /appointments to see updated status

## Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | OK - Request successful              |
| 201  | Created - Resource created           |
| 400  | Bad Request - Invalid input          |
| 401  | Unauthorized - No/Invalid token      |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist   |
| 500  | Server Error - Internal issue        |

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding:

- Requests per minute limits
- IP-based throttling
- Token-based throttling

## CORS Settings

The API accepts requests from:

- http://localhost:3000 (development)
- Any origin (can be restricted in production)

## Security Notes

1. **Never commit .env files** with real credentials
2. **Change JWT_SECRET** in production
3. **Use HTTPS** in production
4. **Validate all inputs** on both frontend and backend
5. **Keep dependencies updated**

## Postman Collection

Import these endpoints into Postman for easier testing:

1. Set base URL: `http://localhost:5000/api`
2. Create environment variable: `token`
3. In Auth response, set: `pm.environment.set("token", pm.response.json().token)`
4. Use `{{token}}` in Authorization header for subsequent requests
