import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { ListingStat } from '../models/listingStat';

// Funkcja do wysyłania e-maila
export const sendEmail = async (req: Request, res: Response) => {
    const { eventDate, location, name, email, phone, message, recipientEmail, listingId } = req.body;

    try {
        // Konfiguracja transportera e-maila
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,       // Użyj zmiennych środowiskowych
                pass: process.env.EMAIL_PASS,       // dla danych logowania
            },
        });

        // Wczytaj szablon HTML
        const templatePath = path.resolve('./src/templates/emailTemplate.hbs');
        const templateSource = fs.readFileSync(templatePath, 'utf-8');

        // Zamiana znaków nowej linii na <br> w treści wiadomości
        const formattedMessage = message.replace(/\n/g, '<br>');

        // Skonfiguruj `handlebars` i przekaż dane do szablonu
        const template = handlebars.compile(templateSource);
        const htmlToSend = template({
            eventDate,
            location,
            name,
            email,
            phone,
            message: formattedMessage, // Przekazanie zamienionej wiadomości
        });
        console.log('Przygotowanie mailOptions');
        // Ustawienie ścieżki do logo
        const logoPath = path.resolve('./src/templates/LOGO.png');
        
        // Konfiguracja opcji wiadomości e-mail
        const mailOptions = {
            from: `Weselny Zakątek <${process.env.EMAIL_USER}>`, 
            to: recipientEmail,
            subject: `Nowa wiadomość od ${name}`,
            html: htmlToSend,
            attachments: [
                {
                    filename: 'LOGO.png',
                    path: logoPath,
                    cid: 'logo', // `cid` dla osadzenia obrazu
                },
            ],
        };

        console.log('mailOptions:', mailOptions); 
        // Wysłanie e-maila
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ message: 'Email wysłany pomyślnie' });
        console.log('Email wysłany!'); // Dodaj log po wysłaniu


        // Inkrementacja inquiries_count
        if (listingId) {
            const stat = await ListingStat.findOne({ where: { listingId } });
            if (stat) {
                stat.inquiriesCount = (stat.inquiriesCount || 0) + 1;
                await stat.save();
                console.log(`Zaktualizowano inquiries_count dla listingId: ${listingId}`);
            } else {
                console.warn(`Brak wpisu w ListingStat dla listingId: ${listingId}`);
            }
        } else {
            console.warn('Brak listingId w żądaniu');
        }
    } catch (error) {
        console.error('Błąd podczas wysyłania e-maila:', error);
        res.status(500).json({ error: 'Nie udało się wysłać e-maila' });
    }
};