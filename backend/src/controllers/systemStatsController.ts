import { Request, Response, NextFunction } from 'express';
import { SystemStat } from '../models/systemStat';

export const getAllSystemStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Pobranie wszystkich danych z tabeli SystemStats
    const stats = await SystemStat.findAll();

    res.status(200).json({
      message: 'System statistics retrieved successfully.',
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching system statistics:', error);
    next(error);
  }
};
