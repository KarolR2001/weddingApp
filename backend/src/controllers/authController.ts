// src/controllers/authController.ts

import { RequestHandler, Request, Response, NextFunction  } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Couple } from '../models/couple';
import { Vendor } from '../models/vendor';
import nodemailer from 'nodemailer';
import { Device } from '../models/devices';
import { NotificationService } from '../services/NotificationService';
import useragent from 'user-agent';



// Wysyła e-mail weryfikacyjny
const sendVerificationEmail = async (email: string, verificationUrl: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailContent = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Potwierdzenie rejestracji</title>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@400&family=Montserrat:wght@400&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Montserrat', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 10px auto; background: #FBF8F1; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        .logo { max-width: 150px; margin: 0 auto 20px; display: block; }
        .content { padding: 15px; color: #787878; line-height: 1.6; font-size: 16px; text-align: left; }
        .description { font-size: 16px; color: #787878; margin-top: 20px; line-height: 25px; }
        .heading { margin: 5px; padding-bottom: 20px; color: #C3937C; font-size: 24px; font-family: 'Cormorant', serif; font-weight: 400; text-transform: uppercase; text-align: left; }
        .button-container { display: flex; justify-content: center; margin-top: 40px; }
        .button { width: 254px; height: 50px; background-color: #EAD9C9; color: #363636; text-decoration: none; border: 0.5px solid #363636; font-size: 14px; font-family: 'Montserrat', sans-serif; font-weight: 400; text-transform: uppercase; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .footer { margin-top: 20px; font-size: 12px; text-align: center; color: #888; }
        .footer a { color: #C3937C; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="cid:logo" alt="Logo" class="logo">
        
        <div class="content">
          <h1 class="heading">Potwierdzenie rejestracji konta</h1>
          
          <p>Witamy w naszej aplikacji! Aby zakończyć proces rejestracji, prosimy kliknąć w poniższy przycisk, aby zweryfikować swoje konto:</p>
          
          <div class="button-container">
            <a href="${verificationUrl}" class="button">Zweryfikuj konto</a>
          </div>
        </div>
        
        <div class="footer">
          <p>Znajdź nas na <a href="https://www.facebook.com">Facebooku</a> i <a href="https://www.instagram.com">Instagramie</a></p>
          <p>&copy; 2023 Weselny Zakątek. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"Weselny Zakątek" <no-reply@example.com>',
      to: email,
      subject: 'Potwierdzenie rejestracji',
      html: emailContent,
      attachments: [{
        filename: 'logo.png',
        path: './src/templates/LOGO.png', // Replace with the correct path
        cid: 'logo'
      }]
    });
    console.log('Verification email sent successfully.');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// Rejestracja użytkownika
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, phoneNumber, userType, partner1Name, partner2Name, companyName } = req.body;

  try {
    // Sprawdzanie, czy e-mail jest już zarejestrowany
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'E-mail już istnieje' });
      return;
    }

    // Hashowanie hasła
    const passwordHash = await bcrypt.hash(password, 10);

    // Create verification token based on userType
    const verificationTokenPayload = userType === 'vendor'
      ? { email, passwordHash, phoneNumber, userType, companyName }
      : { email, passwordHash, phoneNumber, userType, partner1Name, partner2Name };

    const verificationToken = jwt.sign(
      verificationTokenPayload,
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '24h' }
    );

    // Tworzenie linku weryfikacyjnego
    const verificationUrl = `http://localhost:3000/verify?token=${verificationToken}`;

    // Wysyłanie e-maila weryfikacyjnego
    await sendVerificationEmail(email, verificationUrl);

    res.status(200).json({ message: 'Wysłano e-mail weryfikacyjny. Sprawdź swoją skrzynkę pocztową.', verificationToken });
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd podczas rejestracji.' });
  }
};

// Weryfikacja tokenu i tworzenie konta użytkownika
export const verifyUser = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  try {
    console.log("Received token:", token);
    // Dekodowanie i weryfikacja tokenu
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET_KEY!) as {
      email: string;
      passwordHash: string;
      phoneNumber: string;
      userType: 'vendor' | 'couple' | 'admin';
      partner1Name?: string;
      partner2Name?: string;
      companyName?: string;
    };

    console.log("Decoded token:", decoded);
    // Tworzenie użytkownika w bazie danych
    const user = await User.create({
      email: decoded.email,
      passwordHash: decoded.passwordHash,
      phoneNumber: decoded.phoneNumber,
      userType: decoded.userType,
      status: 'active',
    });

// Add to the appropriate table based on userType
    if (decoded.userType === 'couple') {
      await Couple.create({
        coupleId: user.id,
        partner1Name: decoded.partner1Name!,
        partner2Name: decoded.partner2Name,
      });
    } else if (decoded.userType === 'vendor') {
      await Vendor.create({
        vendorId: user.id,
        companyName: decoded.companyName!,
        offersNationwideService: false,
      });
    }

    res.status(200).json({ message: 'Konto zostało pomyślnie zweryfikowane.' });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(400).json({ message: 'Nieprawidłowy lub wygasły token weryfikacyjny.' });
  }
};

export const checkVerificationStatus = async (req: Request, res: Response): Promise<void> => {
  // Rzutowanie `email` na typ `string`
  const email = req.query.email as string;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'Użytkownik nie istnieje.' });
      return;
    }
    const isVerified = user.status === 'active';
    res.status(200).json({ isVerified });
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd podczas sprawdzania statusu weryfikacji.' });
  }
};

const jwtSecret = process.env.JWT_SECRET_KEY || 'jwt_secret';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Znajdź użytkownika wraz z asocjacjami
    const user = await User.findOne({
      where: { email },
      include: [
        { model: Vendor, as: 'vendorProfile' },
        { model: Couple, as: 'coupleProfile' },
      ],
    });

    if (!user) {
      res.status(401).json({ message: 'Nieprawidłowy e-mail lub hasło.' });
      return;
    }

    // Sprawdzenie hasła
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Nieprawidłowy e-mail lub hasło.' });
      return;
    }

    // Generowanie tokenu JWT
    const token = jwt.sign(
      { userId: user.id, userType: user.userType },
      jwtSecret,
      { expiresIn: '12h' }
    );

    // Pobranie danych o urządzeniu
    const userAgent = useragent.parse(req.headers['user-agent'] || '');
    const deviceName = userAgent.device?.toString() || 'Unknown Device';
    const deviceType = userAgent.os?.toString() || 'Unknown OS';
    const ipAddress = req.ip || 'Unknown IP';

    // Sprawdzenie, czy urządzenie istnieje w tabeli
    const existingDevice = await Device.findOne({
      where: {
        userId: user.id,
        deviceName,
        ipAddress,
      },
    });

    if (!existingDevice) {
      // Jeśli urządzenie jest nowe, dodaj je do tabeli
      await Device.create({
        userId: user.id,
        deviceName,
        deviceType,
        ipAddress,
        lastLoginAt: new Date(),
      });

      const notificationMessage = `
        Właśnie zalogowano się na Twoje konto z nowego urządzenia.
        Szczegóły:
        - Nazwa urządzenia: ${deviceName}
        - Typ urządzenia: ${deviceType}
        - Adres IP: ${ipAddress}
        
        Jeśli to nie Ty, zmień swoje hasło natychmiast.
      `;

      (async () => {
        try {
          await NotificationService.createAutomaticNotification({
            userId: user.id,
            message: 'Zalogowano z nowego urządzenia.',
            eventType: 'new_device_login',
            notificationType: 'app',
          });
    
          await NotificationService.createAutomaticNotification({
            userId: user.id,
            message: notificationMessage,
            eventType: 'new_device_login',
            notificationType: 'email',
          });
        } catch (error) {
          console.error('Błąd wysyłania powiadomienia:', error);
        }
      })();
    }

    // Zaktualizuj czas ostatniego logowania
    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    // Wyślij odpowiedź do klienta
    const userData = {
      id: user.id,
      userType: user.userType,
      email: user.email,
      phoneNumber: user.phoneNumber,
      status: user.status,
      vendorProfile: user.vendorProfile,
      coupleProfile: user.coupleProfile,
    };

    res.status(200).json({ message: 'Zalogowano pomyślnie.', token, user: userData });
  } catch (error) {
    console.error('Błąd logowania:', error);
    next(error);
  }
};
