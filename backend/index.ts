import express from 'express';
import './config/db';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import HODRoutes from './routes/HODRoutes';
import FacultyRoutes from './routes/FacultyRoutes';
import StudentRoutes from './routes/StudentRoutes';
import { testEmailConnection } from './utils/emailService';


dotenv.config();
const app = express();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration with credentials support
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true, // Important: This allows cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser()); // Add this line to enable cookie parsing

// Configure EJS for email templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/student',StudentRoutes);
app.use('/api/faculty', FacultyRoutes);
app.use('/api/hod', HODRoutes);

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Test email endpoint
app.get("/test-email", async (req, res) => {
  try {
    const isConnected = await testEmailConnection();
    if (isConnected) {
      res.json({ message: "Email service is working correctly" });
    } else {
      res.status(500).json({ message: "Email service is not working" });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: "Email service error", error: errorMessage });
  }
});

app.listen(process.env.PORT, () => {
    console.log('Server started on port 8080');
    
    // Test email connection on startup
    testEmailConnection().then(isConnected => {
      if (isConnected) {
        console.log('✅ Email service is ready');
      } else {
        console.log('❌ Email service is not working');
      }
    });
});