# Media Gallery Management System

A full-stack Media Gallery Web App with Contact Form integration using the MERN stack. Users (admin + normal users) can manage media files and contact messages with secure authentication.

## Features

### 🔐 Authentication
- Google OAuth 2.0 login
- Manual email/password registration with Gmail OTP verification
- Forgot password via Gmail OTP
- Protected routes using middleware

### 🖼️ Media Gallery
1. **Upload & Validation**
   - Drag & drop image uploads (JPG/PNG, max 5MB)
   - File preview, title, description, and tags

2. **Gallery Management**
   - Personal/shared galleries
   - Search/filter by tags/titles
   - Full-screen image view with slider

3. **CRUD Operations**
   - Add/edit/delete media (metadata + file)
   - Multiple image selection

4. **ZIP Generation**
   - Download selected images as ZIP (frontend/backend)

### 📞 Contact Form
1. **User Actions**
   - Submit messages via contact form
   - Edit/delete own messages

2. **Admin Actions**
   - View all messages
   - Delete messages

### 👥 User Management (Admin Only)
- View/edit user profiles (name, email, role)
- Soft-delete/deactivate users

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Auth**: Google OAuth 2.0, JWT, Nodemailer (OTP)
- **Storage**: Cloudinary (preferred) or local filesystem
- **Libraries**: Multer (upload), Archiver (ZIP), React Dropzone (drag & drop)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Google OAuth credentials
- Cloudinary account (optional)

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://sathma27:sathma2000@cluster0.95woljw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Running the Application

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-otp` - Verify OTP

### Media
- `GET /api/media` - Get all media
- `POST /api/media` - Upload media
- `GET /api/media/:id` - Get media by ID
- `PUT /api/media/:id` - Update media
- `DELETE /api/media/:id` - Delete media
- `POST /api/media/download-zip` - Download ZIP

### Contact
- `POST /api/contact` - Submit contact message
- `GET /api/contact/my-messages` - Get user's messages
- `PUT /api/contact/:id` - Update message
- `DELETE /api/contact/:id` - Delete message
- `GET /api/admin/contact` - Get all messages (admin)
- `DELETE /api/admin/contact/:id` - Delete any message (admin)

### Users
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Soft delete user (admin)

## Project Structure

```
project-root/
├── backend/
│   ├── controllers/
│   │   ├── mediaController.js
│   │   ├── authController.js
│   │   ├── contactController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── Media.js
│   │   ├── User.js
│   │   └── Contact.js
│   ├── routes/
│   │   ├── mediaRoutes.js
│   │   ├── authRoutes.js
│   │   ├── contactRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── utils/
│   │   ├── otp.js
│   │   ├── email.js
│   │   └── cloudinary.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactForm.js
│   │   │   ├── MediaGallery.js
│   │   │   ├── ImageUpload.js
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── ContactPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Gallery.js
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── ...
│   └── ...
├── .env
└── README.md
```

## Contributing

This project was created as an assignment for Gamage Recruiters SE (MERN Stack) Intern position.

## License

This project is for educational purposes. 