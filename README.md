# Immunization Management System

A full-stack web application for healthcare facilities to manage patient vaccination records, schedule immunizations, and track vaccine inventory. Now includes parent portal functionality for families to track their children's immunization records.

## Tech Stack

- **Frontend**: React with React Router
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Scheduling**: Node-cron for automated notifications

## Features

### Healthcare Staff Features
- User authentication with role-based access (Admin, Nurse, Doctor)
- Patient management with complete profiles
- Immunization record tracking
- Vaccine inventory management with low stock alerts
- Dashboard with key metrics and analytics
- Reports for immunization coverage and overdue vaccinations

### Parent Portal Features
- Parent registration and secure login
- Link multiple children to parent account
- View children's complete immunization history
- Real-time notifications for upcoming and overdue immunizations
- Immunization schedule calendar view
- Child profile management
- Automated reminders via notification system

## Setup Instructions

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

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/immunization_db
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start the backend server:
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

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Immunizations
- `GET /api/immunizations` - Get all immunizations
- `GET /api/immunizations/:id` - Get single immunization
- `GET /api/immunizations/overdue` - Get overdue immunizations
- `POST /api/immunizations` - Create immunization record
- `PUT /api/immunizations/:id` - Update immunization
- `DELETE /api/immunizations/:id` - Delete immunization

### Vaccines
- `GET /api/vaccines` - Get all vaccines
- `GET /api/vaccines/:id` - Get single vaccine
- `GET /api/vaccines/low-stock` - Get low stock vaccines
- `POST /api/vaccines` - Create vaccine
- `PUT /api/vaccines/:id` - Update vaccine
- `DELETE /api/vaccines/:id` - Delete vaccine

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/coverage` - Get immunization coverage report

### Parent Portal
- `GET /api/parent/dashboard` - Get parent dashboard statistics
- `GET /api/parent/children` - Get parent's children
- `GET /api/parent/children/:childId/immunizations` - Get child's immunization history
- `GET /api/parent/children/:childId/upcoming` - Get child's upcoming immunizations
- `POST /api/parent/link-child` - Link child to parent account

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread notification count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read

## User Roles

- **Admin**: Full access to all features
- **Nurse**: Can manage patients, immunizations, and vaccines
- **Doctor**: Can view and manage patient records and immunizations
- **Parent**: Can view their children's immunization records, receive notifications, and manage family immunization schedules

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- Role-based authorization

## Development

To run both frontend and backend concurrently during development:

1. Start MongoDB
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm start`

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The build folder will contain the optimized production build.

## License

MIT
