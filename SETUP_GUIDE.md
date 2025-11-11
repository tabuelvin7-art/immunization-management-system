# Complete Setup Guide - Immunization Management System

## Prerequisites

Before starting, ensure you have:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Either local installation or MongoDB Atlas account
- **Git** (optional) - For version control

## Step 1: Project Setup

### Download/Clone the Project
If you have the project files, navigate to the project directory:
```bash
cd immunization-system
```

### Project Structure
Your project should look like this:
```
immunization-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   ├── server.js
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env
├── README.md
└── PARENT_GUIDE.md
```

## Step 2: Database Setup

### Option A: Local MongoDB
1. **Install MongoDB Community Server**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS
   - Start MongoDB service

2. **Verify MongoDB is Running**
   ```bash
   # Check if MongoDB is running (default port 27017)
   netstat -an | grep 27017
   ```

### Option B: MongoDB Atlas (Cloud)
1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Create a new cluster (free tier available)
   - Wait for cluster to be created (2-3 minutes)

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Step 3: Backend Setup

### Navigate to Backend Directory
```bash
cd backend
```

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file:**
   ```bash
   # For Windows
   notepad .env
   
   # For Mac/Linux
   nano .env
   ```

3. **Update the configuration:**
   ```env
   PORT=5000
   
   # For Local MongoDB:
   MONGODB_URI=mongodb://localhost:27017/immunization_db
   
   # For MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/immunization_db
   
   JWT_SECRET=your_very_secure_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

### Start Backend Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected successfully
Notification scheduler initialized - will run daily at 8:00 AM
```

## Step 4: Frontend Setup

### Open New Terminal
Keep the backend running and open a new terminal window.

### Navigate to Frontend Directory
```bash
cd frontend
```

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file:**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ESLINT_NO_DEV_ERRORS=true
   ```

### Start Frontend Development Server
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view immunization-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

## Step 5: Initial System Setup

### Access the Application
1. **Open your browser** and go to: `http://localhost:3000`
2. **You should see** the login page

### Create First Admin User
1. **Click "Register"**
2. **Fill in the form:**
   - Name: Your Name
   - Email: admin@example.com
   - Password: admin123 (or your preferred password)
   - Role: **Admin**
3. **Click "Register"**

### Verify Everything Works
1. **Login** with your admin credentials
2. **Check the dashboard** - you should see the main dashboard
3. **Navigate through** different sections:
   - Patients
   - Immunizations
   - Vaccines
   - Parent Codes
   - Reports

## Step 6: Create Sample Data (Optional)

### Create a Test Patient
1. **Go to Patients** → **Add Patient**
2. **Fill in sample data:**
   - Name: John Doe
   - Date of Birth: 2020-01-15
   - Gender: Male
   - Contact: +1234567890
   - Guardian Name: Jane Doe
   - Guardian Contact: +1234567891

### Add Sample Vaccine
1. **Go to Vaccines** → **Add Vaccine**
2. **Fill in sample data:**
   - Name: MMR Vaccine
   - Manufacturer: Merck
   - Quantity: 50
   - Batch Number: MMR2024001
   - Expiry Date: 2025-12-31

### Create Immunization Record
1. **Go to Immunizations** → **Add Record**
2. **Fill in sample data:**
   - Patient: John Doe
   - Vaccine: MMR Vaccine
   - Date Administered: Today's date
   - Batch Number: MMR2024001

## Step 7: Test Parent Portal

### Generate Parent Code
1. **Go to patient profile** (John Doe)
2. **Click "Generate Parent Code"**
3. **Fill in parent details:**
   - Parent Name: Jane Doe
   - Parent Email: jane.doe@example.com
4. **Copy the generated code**

### Create Parent Account
1. **Open new incognito/private browser window**
2. **Go to** `http://localhost:3000`
3. **Click "Register"**
4. **Fill in form:**
   - Name: Jane Doe
   - Email: jane.doe@example.com (must match exactly)
   - Password: parent123
   - Role: **Parent**

### Link Child Account
1. **Login as parent**
2. **Click "Link Child"**
3. **Enter:**
   - Patient ID: (from the generated code)
   - Verification Code: (6-digit code)
4. **Verify successful linking**

## Troubleshooting

### Common Issues

#### Backend Won't Start
**Error: `ECONNREFUSED` or MongoDB connection failed**
- **Solution:** Ensure MongoDB is running
- **Check:** Connection string in `.env` file
- **Verify:** Database credentials (for Atlas)

#### Frontend Won't Start
**Error: `npm start` fails**
- **Solution:** Delete `node_modules` and run `npm install` again
- **Check:** Node.js version (should be v14+)

#### Can't Connect Frontend to Backend
**Error: Network errors in browser console**
- **Solution:** Verify backend is running on port 5000
- **Check:** `REACT_APP_API_URL` in frontend `.env` file
- **Verify:** No firewall blocking ports

#### Parent Code Generation Fails
**Error: "Access denied" or similar**
- **Solution:** Ensure you're logged in as Admin, Nurse, or Doctor
- **Check:** User role in the system

### Port Conflicts
If ports 3000 or 5000 are already in use:

**Change Backend Port:**
1. Edit `backend/.env`: `PORT=5001`
2. Edit `frontend/.env`: `REACT_APP_API_URL=http://localhost:5001/api`

**Change Frontend Port:**
```bash
# In frontend directory
PORT=3001 npm start
```

### Database Issues
**Clear Database (if needed):**
```bash
# Connect to MongoDB
mongo immunization_db

# Drop database
db.dropDatabase()
```

## Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=very_long_random_string_for_production
MONGODB_URI=your_production_mongodb_connection_string
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

### Security Checklist
- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production
- [ ] Set up proper firewall rules
- [ ] Regular database backups

## Support

### Getting Help
1. **Check logs** in terminal for error messages
2. **Verify** all environment variables are set correctly
3. **Ensure** all dependencies are installed
4. **Test** database connectivity separately

### System Requirements
- **RAM:** Minimum 4GB (8GB recommended)
- **Storage:** 1GB free space
- **Network:** Internet connection for MongoDB Atlas
- **Browser:** Modern browser (Chrome, Firefox, Safari, Edge)

### Performance Tips
- Use MongoDB indexes for large datasets
- Enable MongoDB compression
- Use CDN for production frontend
- Implement caching for frequently accessed data

## Next Steps

After successful setup:
1. **Read** the `PARENT_GUIDE.md` for parent portal usage
2. **Configure** notification schedules as needed
3. **Set up** regular database backups
4. **Train** healthcare staff on the system
5. **Customize** the system for your specific needs

Your Immunization Management System is now ready to use! 🎉