# Media Gallery Frontend

A modern, responsive React application for managing and sharing media files with advanced features like drag-and-drop uploads, real-time search, and admin management.

## 🚀 Features

### User Features
- **Authentication**: Email/password and Google OAuth login
- **Registration**: Email verification with OTP
- **Media Management**: Upload, view, edit, and delete media files
- **Gallery**: Advanced search, filtering, and sorting
- **Bulk Operations**: Select multiple files for download or deletion
- **Profile Management**: Update profile information and avatar
- **Contact Support**: Submit and track support messages

### Admin Features
- **Dashboard**: System overview with statistics
- **User Management**: View, edit, and manage user accounts
- **Support Management**: Handle and reply to user messages
- **System Monitoring**: Track usage and performance metrics

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live search and filtering
- **File Upload**: Drag-and-drop with progress tracking
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Smooth loading animations and skeleton screens

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 🛠️ Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components (Navbar, Footer, etc.)
├── contexts/           # React contexts (Auth, etc.)
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── admin/          # Admin pages
│   └── ...             # Other pages
├── utils/              # Utility functions and API
└── index.js            # Application entry point
```

## 🎨 Styling

This project uses **Tailwind CSS** for styling with custom components and utilities:

- **Custom Colors**: Primary, secondary, success, warning, error
- **Custom Components**: Buttons, cards, badges, inputs
- **Animations**: Fade, slide, scale, and bounce animations
- **Responsive**: Mobile-first responsive design

## 🔧 Configuration

### Tailwind CSS
The project includes custom Tailwind configuration with:
- Custom color palette
- Custom animations and keyframes
- Custom box shadows
- Form and typography plugins

### API Configuration
API calls are configured with:
- Automatic token management
- Request/response interceptors
- Error handling
- Timeout configuration

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Set the following environment variables:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository. 