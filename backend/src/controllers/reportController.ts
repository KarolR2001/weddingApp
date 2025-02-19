import { Request, Response, NextFunction } from 'express';
import { GeneratedReport } from '../models/generatedReport';
import { User } from '../models/user';
import { VendorListing } from '../models/vendorListing';
import { Message } from '../models/message';
import { Notification } from '../models/notification';
import { SystemStat } from '../models/systemStat';
import { Op } from 'sequelize';

export const generateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { reportType } = req.body; // Typ raportu: daily, weekly, monthly
  
    try {
      // Generowanie randomowej liczby od 001 do 999
      const randomNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  
      // Pobranie bieżącej daty w formacie MM.YYYY
      const currentDate = new Date();
      const monthYear = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
  
      // Tworzenie nazwy raportu
      const reportName = `R/${randomNumber}/${monthYear}`;
  
      // Dane przykładowe - zbierane z różnych tabel
      const totalUsers = await User.count();
      const newUsers = await User.count({ where: { created_at: { [Op.gte]: new Date(currentDate.setDate(currentDate.getDate() - 1)) } } });
      const newListings = await VendorListing.count();
      const totalMessages = await Message.count();
      const totalNotifications = await Notification.count();
      const stats = await SystemStat.findOne({ order: [['created_at', 'DESC']] });
  
      const reportData = {
        totalUsers,
        newUsers,
        newListings,
        totalMessages,
        totalNotifications,
        systemStats: stats,
      };
  
      // Zapis raportu w bazie
      const report = await GeneratedReport.create({
        reportName,
        reportType,
        reportData,
      });
  
      res.status(201).json({
        message: 'Report generated successfully.',
        report,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      next(error);
    }
  };
  
export const getAllGeneratedReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, reportType, search } = req.query;
  
    try {
      // Konwersja parametrów paginacji
      const offset = (Number(page) - 1) * Number(limit);
  
      // Warunki filtrowania
      const whereCondition: any = {};
      if (reportType) {
        whereCondition.reportType = reportType;
      }
      if (search) {
        whereCondition.reportName = { [Op.like]: `%${search}%` };
      }
  
      // Pobranie raportów z bazy
      const { rows: reports, count } = await GeneratedReport.findAndCountAll({
        where: whereCondition,
        limit: Number(limit),
        offset,
        order: [['created_at', 'DESC']],
      });
  
      // Zwrócenie wyników
      res.status(200).json({
        totalReports: count,
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        reports,
      });
    } catch (error) {
      console.error('Błąd podczas pobierania raportów:', error);
      next(error);
    }
  };