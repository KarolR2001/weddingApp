import { Request, Response, NextFunction } from 'express';
import { Conversation } from '../models/conversation';
import { Message } from '../models/message';
import { User } from '../models/user';
import { VendorListing } from '../models/vendorListing';
import { Op } from 'sequelize';
import { NotificationService } from '../services/NotificationService';

export const createOrUpdateConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { senderId, receiverId, listingId, messageContent } = req.body;

  try {
    // Znajdź istniejącą konwersację
    let conversation = (await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1Id: senderId, user2Id: receiverId, listingId },
          { user1Id: receiverId, user2Id: senderId, listingId },
        ],
      },
    })) as Conversation | null;

    // Jeśli nie istnieje, utwórz nową
    if (!conversation) {
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: receiverId,
        listingId,
        isReadByUser1: true,
        isReadByUser2: false,
      });
    }

    // Dodaj wiadomość do konwersacji
    const message = await Message.create({
      conversationId: conversation.conversationId,
      senderId,
      receiverId,
      messageContent,
    });

    // Zaktualizuj status odczytu
    if (senderId === conversation.user1Id) {
      conversation.isReadByUser2 = false;
    } else {
      conversation.isReadByUser1 = false;
    }

    await conversation.save();

    // Powiadomienie wewnętrzne
    await NotificationService.createAutomaticNotification({
      userId: receiverId,
      message: 'Masz nową wiadomość !!!',
      eventType: 'new_message',
    });

    // Powiadomienie e-mail
    const emailNotificationMessage = `
      Otrzymałeś nową wiadomość w naszej aplikacji:
      "${messageContent}"`;

    await NotificationService.createAutomaticNotification({
      userId: receiverId,
      message: emailNotificationMessage,
      eventType: 'new_message',
      notificationType: 'email',
    });

    // Zwrot pełnych danych wiadomości z `created_at`
    res.status(201).json({
      message: 'Message sent successfully.',
      conversation,
      newMessage: {
        messageId: message.messageId,
        conversationId: message.conversationId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        messageContent: message.messageContent,
        created_at: message.createdAt, // Dodanie daty utworzenia
      },
    });
  } catch (error) {
    console.error('Error creating or updating conversation:', error);
    next(error);
  }
};



  
// 2. Getting all conversations for a user
export const getAllConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;

  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'email', 'userType'] },
        { model: User, as: 'user2', attributes: ['id', 'email', 'userType'] },
        {
          model: VendorListing,
          as: 'listing',
          attributes: ['listingId', 'title'],
        },
        {
          model: Message,
          as: 'messages',
          attributes: ['created_at'],
          order: [['created_at', 'DESC']], // Pobierz najnowszą wiadomość w każdej konwersacji
          limit: 1,
        },
      ],
      order: [['created_at', 'DESC']], // Sortuj konwersacje po ich dacie utworzenia
    });

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    next(error);
  }
};
export const getConversationsByListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId, listingId } = req.params;

  try {
    const conversations = await Conversation.findAll({
      where: {
        listingId,
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'email', 'userType'] },
        { model: User, as: 'user2', attributes: ['id', 'email', 'userType'] },
        {
          model: VendorListing,
          as: 'listing',
          attributes: ['listingId', 'title'],
        },
        {
          model: Message,
          as: 'messages',
          attributes: ['created_at'],
          order: [['created_at', 'DESC']], // Pobierz najnowszą wiadomość w każdej konwersacji
          limit: 1,
        },
      ],
      order: [['created_at', 'DESC']], // Sortuj konwersacje po ich dacie utworzenia
    });

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations by listing:', error);
    next(error);
  }
};
export const getMessagesForConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.findAll({
      where: { conversationId },
      attributes: ['messageId', 'receiverId', 'senderId', 'messageContent', 'created_at'],
      order: [['created_at', 'ASC']],
    });

    if (!messages || messages.length === 0) {
      res.status(404).json({ message: 'No messages found for this conversation.' });
      return;
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages for conversation:', error);
    next(error);
  }
};

// 3. Marking a conversation as read
export const markConversationAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { conversationId } = req.params;
  const { userId } = req.body;

  try {
    const conversation = await Conversation.findByPk(conversationId);

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    if (userId === conversation.user1Id) {
      conversation.isReadByUser1 = true;
    } else if (userId === conversation.user2Id) {
      conversation.isReadByUser2 = true;
    } else {
      res.status(403).json({ message: 'Not authorized to mark this conversation as read.' });
      return;
    }

    await conversation.save();

    res.status(200).json({ message: 'Conversation marked as read.', conversation });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    next(error);
  }
};
