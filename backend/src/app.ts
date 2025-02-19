import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database';

// Import modeli, aby zapewnić ich zarejestrowanie w Sequelize
import './models/index';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import listingRoutes from './routes/listingRoutes';
import filterRoutes from './routes/filterRoutes';
import reviewRoutes from './routes/reviewRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import calendarRoutes from './routes/calendarRoutes';
import { corsMiddleware } from './middleware/cors';
import guestRoutes from './routes/guestRoutes';
import tableRoutes from './routes/tableRoutes';
import conversationRoutes from './routes/conversationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import admiNnotificationRoutes from './routes/adminNotificationRoutes';
import statsRoutes from './routes/statsRoutes';
import reportsRoutes from './routes/reportRoutes';


dotenv.config();

const app = express();
const path = require('path');
const uploadsPath = path.resolve('uploads');
const publicPath = path.join(__dirname, '../public'); // Dodano public

app.use('/uploads', express.static(uploadsPath));
app.use(express.static(publicPath)); // Obsługa katalogu public
console.log('Pliki statyczne serwowane z:', publicPath);

console.log('Pliki serwowane z:', uploadsPath);
app.use(corsMiddleware);
// Middleware
app.use(cors());
app.use(express.json());

// Trasy
app.use('/api/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/guests', guestRoutes);
app.use('/uploads/images', express.static(path.join(__dirname, '../uploads/images')));
app.use('/api/tables', tableRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', admiNnotificationRoutes);
app.use('/api/system-stats', statsRoutes);
app.use('/api/reports', reportsRoutes);

// Synchronizacja modeli z bazą danych
sequelize.sync({ alter: false })
  .then(() => {
    console.log('Baza danych została zsynchronizowana.');
  })
  .catch((err) => {
    console.error('Błąd podczas synchronizacji bazy danych:', err);
  });

export default app;
