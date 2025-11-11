# Troubleshooting Guide - Immunization Management System

## Common Issues and Solutions

### 1. Verification Code Issues

#### Problem: "Verification code not defined" or "Invalid verification code"

**Possible Causes:**
1. Code has expired (48-hour limit)
2. Code has already been used
3. Wrong patient ID
4. Email mismatch between parent account and code
5. Code not properly generated

**Solutions:**

**Step 1: Check Code Generation**
```bash
# In backend directory, check if code was generated
# Look for console logs when generating code
npm run dev
```

**Step 2: Verify Parent Email**
- Ensure parent registered with EXACT same email used when generating code
- Check for typos, extra spaces, or case differences
- Email comparison is case-insensitive but must match exactly

**Step 3: Check Code Expiration**
- Codes expire after 48 hours
- Generate a new code if expired
- Check system time on server

**Step 4: Debug in Development**
```javascript
// Add to frontend LinkChild.js for debugging
console.log('Submitting:', { childId, verificationCode });

// Check backend logs for detailed error info
```

**Step 5: Manual Database Check**
```javascript
// In MongoDB shell or compass
db.verificationcodes.find({ patientId: "PATIENT_ID_HERE" })
```

### 2. Database Connection Issues

#### Problem: "MongoDB connection failed"

**Solutions:**
1. **Check MongoDB Service**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```

2. **Verify Connection String**
   ```env
   # Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/immunization_db
   
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/immunization_db
   ```

3. **Check Firewall/Network**
   - Ensure port 27017 is open (local)
   - Check internet connection (Atlas)
   - Verify IP whitelist (Atlas)

### 3. Authentication Issues

#### Problem: "Not authorized" or login failures

**Solutions:**
1. **Check JWT Secret**
   ```env
   JWT_SECRET=your_very_secure_secret_key_here
   ```

2. **Clear Browser Storage**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Check Token Expiration**
   - Default: 7 days
   - Re-login if expired

### 4. Parent Portal Access Issues

#### Problem: Parent can't see children or notifications

**Solutions:**
1. **Verify Role Assignment**
   ```javascript
   // Check user role in database
   db.users.findOne({ email: "parent@example.com" })
   ```

2. **Check Child Linking**
   ```javascript
   // Verify parentUser field is set
   db.patients.findOne({ _id: "PATIENT_ID" })
   ```

3. **Notification Generation**
   ```bash
   # Check if scheduler is running
   # Look for: "Notification scheduler initialized"
   ```

### 5. Frontend Build Issues

#### Problem: React app won't start or build fails

**Solutions:**
1. **Clear Node Modules**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node Version**
   ```bash
   node --version  # Should be v14+
   npm --version
   ```

3. **Environment Variables**
   ```env
   # frontend/.env
   REACT_APP_API_URL=http://localhost:5000/api
   ESLINT_NO_DEV_ERRORS=true
   ```

### 6. API Connection Issues

#### Problem: Frontend can't connect to backend

**Solutions:**
1. **Check Backend Status**
   ```bash
   curl http://localhost:5000/api/auth/me
   ```

2. **Verify CORS Settings**
   ```javascript
   // In backend/server.js
   app.use(cors());
   ```

3. **Check API URL**
   ```javascript
   // In frontend/src/services/api.js
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
   ```

### 7. Performance Issues

#### Problem: Slow loading or timeouts

**Solutions:**
1. **Database Indexing**
   ```javascript
   // Add indexes for frequently queried fields
   db.patients.createIndex({ parentUser: 1 })
   db.immunizations.createIndex({ patient: 1 })
   db.verificationcodes.createIndex({ patientId: 1, code: 1 })
   ```

2. **Optimize Queries**
   - Use populate() selectively
   - Limit result sets
   - Add pagination for large datasets

3. **Check System Resources**
   - Available RAM
   - CPU usage
   - Disk space

## Debug Commands

### Backend Debugging
```bash
# Start with detailed logging
DEBUG=* npm run dev

# Check specific routes
curl -X POST http://localhost:5000/api/parent/link-child \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"childId":"PATIENT_ID","verificationCode":"123456"}'
```

### Frontend Debugging
```javascript
// In browser console
// Check local storage
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));

// Check API calls
// Open Network tab in DevTools
```

### Database Debugging
```javascript
// MongoDB shell commands
use immunization_db

// Check collections
show collections

// Check verification codes
db.verificationcodes.find().pretty()

// Check patients
db.patients.find({ parentUser: { $exists: true } }).pretty()

// Check users
db.users.find({ role: "Parent" }).pretty()
```

## Environment-Specific Issues

### Development Environment
- Use detailed error messages
- Enable debug logging
- Check console outputs
- Use MongoDB Compass for visual debugging

### Production Environment
- Check server logs
- Verify environment variables
- Ensure HTTPS is configured
- Monitor database performance

## Getting Additional Help

### Log Collection
When reporting issues, include:
1. **Backend logs** (console output)
2. **Frontend console errors** (browser DevTools)
3. **Network requests** (DevTools Network tab)
4. **Environment details** (OS, Node version, MongoDB version)

### Useful Commands
```bash
# System information
node --version
npm --version
mongod --version

# Process information
ps aux | grep node
ps aux | grep mongod

# Port usage
netstat -tulpn | grep :5000
netstat -tulpn | grep :3000
netstat -tulpn | grep :27017
```

### Contact Information
- Check GitHub issues for similar problems
- Review setup guide for missed steps
- Verify all dependencies are installed
- Test with sample data first

## Prevention Tips

1. **Regular Backups**
   - Database backups
   - Configuration backups
   - Code version control

2. **Monitoring**
   - Set up health checks
   - Monitor error rates
   - Track performance metrics

3. **Testing**
   - Test verification code flow regularly
   - Verify email configurations
   - Check notification delivery

4. **Documentation**
   - Keep environment variables documented
   - Document any custom configurations
   - Maintain deployment procedures