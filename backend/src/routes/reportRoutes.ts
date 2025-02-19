import { Router } from 'express';
import { generateReport, getAllGeneratedReports } from '../controllers/reportController';

const router = Router();

// Endpoint do generowania raportu
router.post('/generated-reports', generateReport);
// Pobieranie wszystkich raportów
router.get('/', getAllGeneratedReports);

export default router;
