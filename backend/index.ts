import express from 'express';
import './config/db';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import AuthRoutes from './routes/AuthRoutes';
import StudentRoutes from './routes/StudentRoutes';

dotenv.config();
const app = express();
app.use(cors({
    origin: 'http://localhost:8080'
}));
app.use(express.json());
app.use()

app.use('/api/auth', AuthRoutes);
app.use('/api/student',StudentRoutes);

app.listen(process.env.PORT, () => {
    console.log('Server started on port 8080');
});