# ExamBridge

ExamBridge is a comprehensive online examination platform designed to provide accessible and secure testing environments for students and educators. Built with modern web technologies, it offers features like real-time exam monitoring, accessibility tools, and robust security measures.

## Features

### For Students
- **Accessible Interface**: Built-in accessibility tools including dyslexia support, hearing impairment accommodations, and visual aids
- **Secure Exam Environment**: Browser lockdown and monitoring to prevent cheating
- **Real-time Timer**: Countdown timer with automatic submission
- **Certificate Generation**: Automatic certificate generation upon completion
- **User-friendly Dashboard**: Easy navigation and exam management

### For Teachers
- **Quiz Creation**: Intuitive quiz builder with various question types
- **Exam Monitoring**: Real-time monitoring of student activities during exams
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Accessibility Preview**: Test accessibility features before deployment
- **Student Management**: Manage student accounts and results

### Security & Accessibility
- **Exam Lockdown**: Prevents unauthorized access and tab switching
- **Accessibility Compliance**: WCAG compliant with multiple accessibility modes
- **Data Security**: Secure data handling and storage
- **Audit Trail**: Complete logging of exam activities

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for state management

### Backend
- **Node.js** with Express.js
- **JWT Authentication**
- **File Upload** handling
- **Email Services**
- **Data Validation** and processing

### Database
- JSON-based data storage (easily replaceable with SQL/NoSQL databases)

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/prajan1110/EXAMBRIDGE.git
cd EXAMBRIDGE
```

2. Install dependencies:
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

3. Start the development servers:
```bash
npm run dev:all
```

This will start both the frontend (http://localhost:8080) and backend (port 3001) servers.

### Environment Setup

Create `.env` files in both root and `server/` directories based on the `.env.example` files.

## Project Structure

```
ExamBridge/
├── public/                 # Static assets
├── server/                 # Backend Node.js application
│   ├── middleware/         # Express middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── src/                   # Frontend React application
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   └── services/          # API service functions
└── package.json           # Project dependencies and scripts
```

## API Documentation

Detailed API documentation is available in `server/API-DOCUMENTATION.md`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Team

Powered by Team Shiksha

## Support

For support, email the development team or create an issue in this repository.