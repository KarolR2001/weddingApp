import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, markAsRead, setSelectedConversation } from '../../redux/slices/messagesSlice';
import { Conversation } from '../../redux/slices/messagesSlice';
import { AppDispatch, RootState } from '../../redux/store';
import styles from '../../styles/MessageComponent/ConversationItem.module.css';
import usersIcon from '../../assets/users.svg';

interface Props {
  conversation: Conversation;
}

const ConversationItem: React.FC<Props> = ({ conversation }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Pobierz ID użytkownika zalogowanego z Redux
  const loggedInUserId = useSelector((state: RootState) => state.auth.user?.id);

  const handleClick = () => {
    if (!loggedInUserId) return;

    // Ustaw wybraną konwersację w Redux
    dispatch(setSelectedConversation(conversation));

    // Pobierz wiadomości
    dispatch(fetchMessages(conversation.conversationId));

    // Oznacz wiadomości jako przeczytane
    dispatch(
      markAsRead({
        conversationId: conversation.conversationId,
        userId: loggedInUserId,
      })
    );
  };

  // Wyświetlana nazwa (nazwa ogłoszenia lub e-mail użytkownika)
  const displayName = conversation.listing
    ? conversation.listing.title
    : conversation.user1Id === loggedInUserId
    ? conversation.user2.email
    : conversation.user1.email;

  // Data ostatniej wiadomości
  const lastMessageDate = new Date(conversation.messages[0]?.created_at).toLocaleDateString();

  // Czy wiadomość jest nieprzeczytana
  const isUnread =
    (conversation.user1Id === loggedInUserId && !conversation.isReadByUser1) ||
    (conversation.user2Id === loggedInUserId && !conversation.isReadByUser2);

  return (
    <div className={styles.conversationItem} onClick={handleClick}>
      <div className={styles.leftSection}>
        <img src={usersIcon} alt="User Icon" className={styles.icon} />
        <span className={`${styles.name} ${isUnread ? styles.unread : ''}`}>{displayName}</span>
      </div>
      <span className={styles.date}>{lastMessageDate}</span>
    </div>
  );
};

export default ConversationItem;
