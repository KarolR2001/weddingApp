import { Request, Response, NextFunction } from 'express';
import { Calendar } from '../models/calendar';

export const modifyCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { action, listingId, date, availabilityStatus } = req.body;

  if (!listingId || !date || !action) {
    res.status(400).json({ message: 'Missing required parameters.' });
    return;
  }

  try {
    if (action === 'add') {
      // Dodawanie nowego wiersza
      const newEntry = await Calendar.create({ listingId, date, availabilityStatus });
      res.status(201).json({ message: 'Entry added successfully.', data: newEntry });
    } else if (action === 'delete') {
      // Usuwanie wiersza
      const deletedCount = await Calendar.destroy({
        where: { listingId, date },
      });

      if (deletedCount === 0) {
        res.status(404).json({ message: 'No entry found to delete.' });
      } else {
        res.status(200).json({ message: 'Entry deleted successfully.' });
      }
    } else {
      res.status(400).json({ message: 'Invalid action. Use "add" or "delete".' });
    }
  } catch (error) {
    console.error('Error modifying calendar:', error);
    res.status(500).json({ message: 'Internal server error.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
