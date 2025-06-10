import express from 'express';
import './config/db';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
app.use(cors({
    origin: 'http://localhost:8080'
}));
app.use(express.json());
app.use()

app.listen(process.env.PORT, () => {
    console.log('Server started on port 8080');
});