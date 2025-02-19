import { Request, Response, NextFunction } from 'express';
import { GuestList } from '../models/guestList';
import { Table } from '../models/table';
import { TableAssignment } from '../models/tableAssignment';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';

export const addTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { coupleId, tableName, tableShape, maxGuests } = req.body;
  
    try {
      const table = await Table.create({ coupleId, tableName, tableShape, maxGuests });
      res.status(201).json({ message: 'Stół został dodany.', table });
    } catch (error) {
      console.error('Błąd przy dodawaniu stołu:', error);
      next(error);
    }
  };
  export const getTablesWithGuests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { coupleId } = req.params;
  
    try {
      const tables = await Table.findAll({
        where: { coupleId },
        include: [
          {
            model: TableAssignment,
            as: 'assignments',
            include: [{ model: GuestList, as: 'guest' }],
          },
        ],
      });
      res.status(200).json({ tables });
    } catch (error) {
      console.error('Błąd przy pobieraniu listy stołów:', error);
      next(error);
    }
  };
  export const editTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { tableId } = req.params;
    const { tableName, tableShape, maxGuests } = req.body;
  
    try {
      const table = await Table.findByPk(tableId);
  
      if (!table) {
        res.status(404).json({ message: 'Stół nie został znaleziony.' });
        return;
      }
  
      table.tableName = tableName || table.tableName;
      table.tableShape = tableShape || table.tableShape;
      table.maxGuests = maxGuests || table.maxGuests;
  
      await table.save();
      res.status(200).json({ message: 'Stół został zaktualizowany.', table });
    } catch (error) {
      console.error('Błąd przy edycji stołu:', error);
      next(error);
    }
  };
  export const removeTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { tableId } = req.params;
  
    try {
      const table = await Table.findByPk(tableId);
  
      if (!table) {
        res.status(404).json({ message: 'Stół nie został znaleziony.' });
        return;
      }
  
      await TableAssignment.destroy({ where: { tableId } }); // Usuwamy przypisania gości
      await table.destroy(); // Usuwamy stół
  
      res.status(200).json({ message: 'Stół został usunięty.' });
    } catch (error) {
      console.error('Błąd przy usuwaniu stołu:', error);
      next(error);
    }
  };
  export const assignGuestToTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { tableId, guestId } = req.body;
  
    try {
      const assignment = await TableAssignment.create({ tableId, guestId });
      res.status(201).json({ message: 'Gość został przypisany do stołu.', assignment });
    } catch (error) {
      console.error('Błąd przy przypisywaniu gościa do stołu:', error);
      next(error);
    }
  };
  export const removeGuestFromTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { tableId, guestId } = req.body;
  
    try {
      const assignment = await TableAssignment.findOne({ where: { tableId, guestId } });
  
      if (!assignment) {
        res.status(404).json({ message: 'Przypisanie nie zostało znalezione.' });
        return;
      }
  
      await assignment.destroy();
      res.status(200).json({ message: 'Przypisanie gościa do stołu zostało usunięte.' });
    } catch (error) {
      console.error('Błąd przy usuwaniu przypisania gościa:', error);
      next(error);
    }
  };
  export const getGuestsWithoutTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { coupleId } = req.params;
  
    try {
      const guests = await GuestList.findAll({
        where: {
          coupleId,
          guestId: {
            [Op.notIn]: sequelize.literal(`(SELECT guest_id FROM TableAssignments)`),
          },
        },
      });
      res.status(200).json({ guests });
    } catch (error) {
      console.error('Błąd przy pobieraniu gości bez przypisania:', error);
      next(error);
    }
  };
  