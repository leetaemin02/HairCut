# MongoDB Atlas Setup Guide

## Step-by-Step: Connect MongoDB Atlas to Your Project

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign In"
3. Create account with email
4. Verify email address

### Step 2: Create a Free Cluster

1. Click "Create a Project"
2. Name it: `haircut-app`
3. Click "Create Project"
4. Click "Build a Cluster"
5. Select **FREE M0 Cluster** tier
6. Choose region closest to you
7. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Setup Database Access (Create User)

1. On left sidebar, click **Database Access**
2. Click **"Add New Database User"**
3. Fill in:
   - **Username**: `haircut_user` (or any username)
   - **Password**: Create a strong password (copy it!)
   - **Built-in Roles**: Select `readWriteAnyDatabase`
4. Click **"Add User"**

⚠️ **IMPORTANT**: Copy your password immediately! You won't see it again.

### Step 4: Setup Network Access (Whitelist IP)

1. On left sidebar, click **Network Access**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, use specific IPs
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go back to **Clusters**
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Choose:
   - Driver: **Node.js**
   - Version: **4.1 or later**
5. Copy the connection string
6. It looks like:

```
mongodb+srv://haircut_user:PASSWORD@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

### Step 6: Update Your `.env` File

Replace `USERNAME`, `PASSWORD`, and `CLUSTER_NAME` in your `.env`:

```env
MONGODB_URI=mongodb+srv://haircut_user:YOUR_PASSWORD@cluster0.mongodb.net/haircut-appointments?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

**Example:**

```env
MONGODB_URI=mongodb+srv://haircut_user:MySecurePass123@cluster0.hc3q4.mongodb.net/haircut-appointments?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=my_super_secret_jwt_key_2025
NODE_ENV=development
```

### Step 7: Test Connection

1. Start your backend:

```bash
cd backend
npm run dev
```

2. You should see in terminal:

```
Server running on port 5000
MongoDB connected
```

✅ If you see "MongoDB connected" → Success!
❌ If connection fails → Check Steps 3-5

---

## 🔧 Troubleshooting Connection Issues

### Error: "authentication failed"

**Solution**:

- Verify username and password in `.env`
- Make sure password is URL-encoded (use special character escape if needed)
- Check user exists in Database Access section

### Error: "connect ECONNREFUSED"

**Solution**:

- Check Network Access allows your IP
- Verify cluster is running (not paused)
- Check internet connection

### Error: "Invalid connection string"

**Solution**:

- Copy connection string again from Atlas
- Make sure you replaced username and password
- Add database name: `.../haircut-appointments?...`

---

## 📊 Verify Your MongoDB Atlas Setup

### View Your Data in MongoDB Atlas:

1. Go to **Clusters** → Click **"Browse Collections"**
2. You should see database: `haircut-appointments`
3. Collections will appear as you create data:
   - `users` - customer/barber/admin accounts
   - `appointments` - appointment bookings
   - `services` - haircut services
   - `qrcodes` - QR code records

### Create Test Data Manually:

1. Click **"Browse Collections"**
2. Click **"Create Database"**
3. Database name: `haircut-appointments`
4. Collection name: `services`
5. Click **"Create"**
6. Click **"+"** to add document
7. Paste:

```json
{
  "name": "Basic Haircut",
  "description": "Standard haircut",
  "price": 25,
  "duration": 30,
  "isActive": true
}
```

8. Click **"Insert"**

---

## 📋 Your Models Are Automatically Linked!

Your project files already have everything connected:

### How it works:

```
.env (MONGODB_URI)
   ↓
server.js (mongoose.connect)
   ↓
models/ (User.js, Appointment.js, Service.js, QRCode.js)
   ↓
controllers/ (Create, read, update, delete operations)
   ↓
API endpoints (/api/appointments, /api/services, etc.)
```

### When you run `npm run dev`:

1. Node.js reads `.env` file
2. Mongoose connects to MongoDB Atlas
3. All models automatically sync with your database
4. API endpoints can now create/read/update/delete data

---

## 🚀 Start Using Your Database

### Register a user:

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

✅ Data automatically saved to MongoDB Atlas!

### View in MongoDB Atlas:

1. Go to **Clusters** → **Browse Collections**
2. Click `haircut-appointments` database
3. Click `users` collection
4. See your new user!

---

## 💡 Quick Commands

```powershell
# Test connection
cd backend
npm run dev

# Check if MongoDB is connected
# Look for: "MongoDB connected" message

# View backend logs
# Shows all database operations
```

---

## ⚠️ Security Notes

- Never commit `.env` to GitHub
- Keep your password safe
- Change JWT_SECRET for production
- For production, use specific IPs instead of 0.0.0.0/0
- Monitor API usage in Atlas dashboard

---

## 📱 Access Your Data Anytime

**MongoDB Atlas Dashboard:**

- Clusters → Browse Collections → See all your data
- Real-time database monitoring
- Backups and snapshots
- Easy to scale when needed

---

**Your models are 100% linked to MongoDB Atlas once you set up the `.env` file!** 🎉

Questions? Check the error messages in your terminal - they usually tell you exactly what's wrong.
