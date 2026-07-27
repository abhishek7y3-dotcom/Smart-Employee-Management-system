import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import chatRoutes from './routes/chatRoutes';
import communicationRoutes from './routes/communicationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import holidayRoutes from './routes/holidayRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import leaveRoutes from './routes/leaveRoutes';
import profileRoutes from './routes/profileRoutes';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Security headers add karta hai taaki basic attacks (jaise XSS) se bacha ja sake
app.use(helmet());
// Frontend (React/Next) ko backend se API call karne ki permission deta hai (CORS policy)
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(json());
app.use(urlencoded({ extended: true }));

// Sabhi APIs ke main Routes yahan define kiye gaye hain
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/profile', profileRoutes);

// Agar user koi galat URL access kare (jo bani hi nahi hai) toh usko handle karna
app.use(notFoundHandler);
// Poore app me kahin bhi error aaye, toh server crash hone ke bajaye yahan se error response handle hota hai
app.use(errorHandler);

export default app;
