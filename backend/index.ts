import express from 'express';
import './config/db';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
// import HODRoutes from './routes/HODRoutes';
// import FacultyRoutes from './routes/FacultyRoutes';
// import StudentRoutes from './routes/StudentRoutes';
import AuthRoutes from './routes/AuthRoutes';
// import { testEmailConnection } from './utils/emailService';
import { seedDatabase } from './utils/seedDatabase';


dotenv.config();
const app = express();

// Get __dirname equivalent for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// CORS configuration with credentials support
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true, // Important: This allows cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser()); // Add this line to enable cookie parsing

// Configure EJS for email templates
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// Routes commented out temporarily due to schema changes
// TODO: Update controllers to use User model for authentication
// app.use('/api/student',StudentRoutes);
// app.use('/api/faculty', FacultyRoutes);
// app.use('/api/hod', HODRoutes);
app.use('/api/auth', AuthRoutes);

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Health check and seed endpoint
// app.get("/health", async (req, res) => {
//   try {
//     const seedParam = req.query.seed;
    
//     if (seedParam === 'true') {
//       // Seed the database
//       const result = await seedDatabase();
//       res.json({
//         status: 'healthy',
//         message: 'Database seeded successfully',
//         data: result,
//         timestamp: new Date().toISOString(),
//       });
//     } else {
//       // Just health check
//       res.json({
//         status: 'healthy',
//         message: 'Server is running',
//         timestamp: new Date().toISOString(),
//         info: 'Add ?seed=true to seed the database with dummy data',
//       });
//     }
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//     res.status(500).json({
//       status: 'unhealthy',
//       message: 'Error during operation',
//       error: errorMessage,
//       timestamp: new Date().toISOString(),
//     });
//   }
// });

app.listen(process.env.PORT, () => {
    console.log('Server started on port 3000');
});