// src/controllers/categoryController.ts
import { RequestHandler } from 'express';
import { ServiceCategory } from '../models/serviceCategory';
import { FilterCategory } from '../models/filterCategory';
import { FilterOption } from '../models/filterOption';

//Zwraca ID oraz nazwe
export const getCategoryNames: RequestHandler = async (req, res, next) => {
  try {
    const categories = await ServiceCategory.findAll({
      attributes: ['category_id', 'categoryName'], // Zwraca category_id i categoryName
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// Zwraca wszystkie szczegóły kategorii
export const getCategoryDetails: RequestHandler = async (req, res, next) => {
  try {
    const categories = await ServiceCategory.findAll(); // Zwraca pełne szczegóły
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Zwraca szczegóły konkretnej kategorii na podstawie ID
export const getCategoryById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      res.status(404).json({ message: 'Kategoria nie znaleziona' });
      return;
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    next(error);
  }
};



