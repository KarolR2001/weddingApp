// src/controllers/filterController.ts

import { Request, Response, NextFunction } from 'express';
import { FilterCategory } from '../models/filterCategory';
import { FilterOption } from '../models/filterOption';

export const getFiltersByServiceCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { serviceCategoryId } = req.params;

  try {
    // Fetch filter categories with their options
    const filterCategories = await FilterCategory.findAll({
      where: { serviceCategoryId },
      attributes: ['filterCategoryId', 'filterName', 'displayType'],
      include: [
        {
          model: FilterOption,
          as: 'filterOptions',
          attributes: ['filterOptionId', 'optionName'],
        },
      ],
    });

    if (filterCategories.length === 0) {
      res.status(404).json({ message: 'Brak filtrów dla tej kategorii usług.' });
      return; // Exit the function after sending the response
    }

    // Send the response without returning it
    res.status(200).json(filterCategories);
  } catch (error) {
    console.error(error);
    next(error); // Pass the error to Express error handlers
  }
};
