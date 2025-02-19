import cors from 'cors';

// Konfiguracja CORS
export const corsOptions = {
  origin: 'http://localhost:3000', // Dostosuj do swojego klienta
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

export const corsMiddleware = cors(corsOptions);
