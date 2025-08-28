import { Router } from 'express';
import aiService from '../services/aiService';

const router = Router();

router.post('/query', async (req, res) => {
  try {
    const r = await aiService.post('/assistant/query', req.body);
    res.json(r.data);
  } catch (e: any) {
    console.error('AI Service error:', e?.message || e);
    res.status(502).json({ error: 'Assistant service unavailable' });
  }
});

export default router;


