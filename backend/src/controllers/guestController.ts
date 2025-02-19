import { Request, Response, NextFunction } from 'express';
import { GuestList } from '../models/guestList';
import { GuestGroup } from '../models/guestGroup';
import XLSX from 'xlsx';
import path from 'path';

export const getGuestList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { coupleId } = req.params;
  
    try {
      const guestList = await GuestList.findAll({
        where: { coupleId },
        include: [
          { model: GuestGroup, as: 'group', attributes: ['groupId', 'groupName'] },
        ],
      });
  
      res.status(200).json({ guestList });
    } catch (error) {
      console.error('Błąd przy pobieraniu listy gości:', error);
      next(error);
    }
  };
  export const addGuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { coupleId, guestName, guestStatus, groupId, notes } = req.body;
  
    try {
      const newGuest = await GuestList.create({ coupleId, guestName, guestStatus, groupId, notes });
      res.status(201).json({ message: 'Dodano nowego gościa.', newGuest });
    } catch (error) {
      console.error('Błąd przy dodawaniu nowego gościa:', error);
      next(error);
    }
  };
  export const updateGuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { guestId } = req.params;
    const { guestName, guestStatus, groupId, notes } = req.body;
  
    try {
      const guest = await GuestList.findByPk(guestId);
  
      if (!guest) {
        res.status(404).json({ message: 'Gość nie został znaleziony.' });
        return;
      }
  
      if (guestName) guest.guestName = guestName;
      if (guestStatus) guest.guestStatus = guestStatus;
      if (groupId) guest.groupId = groupId;
      if (notes) guest.notes = notes;
  
      await guest.save();
  
      res.status(200).json({ message: 'Dane gościa zostały zaktualizowane.', guest });
    } catch (error) {
      console.error('Błąd przy aktualizacji danych gościa:', error);
      next(error);
    }
  };
  export const removeGuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { guestId } = req.params;
  
    try {
      const guest = await GuestList.findByPk(guestId);
  
      if (!guest) {
        res.status(404).json({ message: 'Gość nie został znaleziony.' });
        return;
      }
  
      await guest.destroy();
  
      res.status(200).json({ message: 'Gość został usunięty.' });
    } catch (error) {
      console.error('Błąd przy usuwaniu gościa:', error);
      next(error);
    }
  };
  export const addGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { coupleId, groupName } = req.body;
  
    try {
      const newGroup = await GuestGroup.create({ coupleId, groupName });
      res.status(201).json({ message: 'Dodano nową grupę.', newGroup });
    } catch (error) {
      console.error('Błąd przy dodawaniu nowej grupy:', error);
      next(error);
    }
  };
  export const removeGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params;

    try {
      // Ustawienie `group_id` na NULL w tabeli GuestList dla usuwanej grupy
      await GuestList.update({ groupId: undefined }, { where: { groupId } });
  
      // Usunięcie grupy
      await GuestGroup.destroy({ where: { groupId } });
  
      res.status(200).json({ message: 'Grupa została usunięta.' });
    } catch (error) {
      console.error('Błąd przy usuwaniu grupy:', error);
      res.status(500).json({ message: 'Nie udało się usunąć grupy.' });
    }
  };

  
  export const getGuestGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupleId = parseInt(req.params.coupleId, 10);
  
      if (isNaN(coupleId)) {
        res.status(400).json({ message: 'Invalid couple ID.' });
        return;
      }
  
      const guestGroups = await GuestGroup.findAll({
        where: { coupleId },
        attributes: ['groupId', 'groupName'], // Usuń `createdAt`
      });
  
      res.status(200).json({ guestGroups });
    } catch (error) {
      console.error('Error fetching guest groups:', error);
      next(error);
    }
  };
  
type Row = {
  guestName: string;
  guestStatus: 'Zaproszony' | 'Potwierdzony' | 'Odmówił';
  notes?: string;
};

const statusMapping: { [key in Row['guestStatus']]: 'invited' | 'confirmed' | 'declined' } = {
  Zaproszony: 'invited',
  Potwierdzony: 'confirmed',
  Odmówił: 'declined',
};

export const importGuestsXlsx = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { coupleId } = req.body;

    if (!req.file) {
      res.status(400).json({ message: 'Nie przesłano pliku XLSX.' });
      return;
    }

    if (!coupleId) {
      res.status(400).json({ message: 'Brak coupleId w żądaniu.' });
      return;
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Odczytanie danych z arkusza do obiektów
    const rows: Row[] = XLSX.utils.sheet_to_json<Row>(worksheet, {
      header: ['guestName', 'guestStatus', 'notes'], // Określenie nagłówków
      range: 1, // Pominięcie nagłówka w pierwszym wierszu
      raw: false,
    });

    // Mapowanie wierszy i walidacja danych
    const guests = rows
      .filter((row) => {
        const isValidStatus = row.guestStatus && statusMapping[row.guestStatus];
        return row.guestName && isValidStatus; // Tylko wiersze z poprawnym statusem i nazwą gościa
      })
      .map((row) => ({
        coupleId,
        guestName: row.guestName,
        guestStatus: statusMapping[row.guestStatus], // Mapowanie statusu
        notes: row.notes || undefined, // Zamiana pustych notatek na undefined
      }));

    // Sprawdzenie, czy są dane do zaimportowania
    if (guests.length === 0) {
      res.status(400).json({ message: 'Brak poprawnych danych do zaimportowania.' });
      return;
    }

    // Dodanie danych do bazy
    await GuestList.bulkCreate(guests);

    res.status(200).json({
      message: 'Dane gości zostały zaimportowane.',
      imported: guests.length,
    });
  } catch (error) {
    console.error('Błąd podczas importu pliku XLSX:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas importu pliku XLSX.' });
  }
};
  
export const downloadTemplateXlsx = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Rozpoczęto obsługę endpointu /template-xlsx');

  const filePath = path.join(__dirname, '../../public/guest_template.xlsx');
  console.log('Ścieżka do pliku:', filePath);

  const fs = require('fs');
  if (!fs.existsSync(filePath)) {
    console.error('Plik nie istnieje:', filePath);
    res.status(404).json({ message: 'Plik nie został znaleziony.' });
    return;
  }

  res.download(filePath, 'guest_template.xlsx', (err) => {
    if (err) {
      console.error('Błąd podczas pobierania pliku:', err);
      res.status(500).json({ message: 'Nie udało się pobrać pliku.' });
    } else {
      console.log('Plik został pomyślnie pobrany');
    }
  });
};