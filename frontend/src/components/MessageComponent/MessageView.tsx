import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MessageItem from './MessageItem';
import { RootState, AppDispatch } from '../../redux/store';
import { sendMessage } from '../../redux/slices/messagesSlice';
import styles from '../../styles/MessageComponent/MessageView.module.css';
import usersIcon from '../../assets/users.svg';
import penIcon from '../../assets/pen.svg';
import Button2 from '../Button2';
import Textarea from '../Textarea';

const MessageView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedConversation, messages } = useSelector((state: RootState) => state.messages);
  const loggedInUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);



  const displayName = selectedConversation
    ? selectedConversation.listing
      ? selectedConversation.listing.title
      : selectedConversation.user1.email
    : 'Brak wybranej konwersacji';

  const handleSendMessage = () => {
    if (!messageContent.trim() || !loggedInUserId || !selectedConversation) return;

    const receiverId =
      selectedConversation.user1Id === loggedInUserId
        ? selectedConversation.user2Id
        : selectedConversation.user1Id;

    dispatch(
      sendMessage({
        senderId: loggedInUserId,
        receiverId,
        listingId: selectedConversation.listingId,
        messageContent,
      })
    );

    setMessageContent('');
  };

  return (
    <div className={styles.messageView}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <img src={usersIcon} alt="User Icon" className={styles.icon} />
          <h2 className={styles.displayName}>{displayName}</h2>
        </div>
      </div>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <MessageItem key={msg.messageId} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.replyBox}>
      <div className={styles.areaInput}>
        <img src={penIcon} alt="Pen Icon" className={styles.icon} />
        <Textarea
          placeholder="Odpowiedz..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          
          maxLength={500}
        />
      </div>
      <div className={styles.buttonSend}>
        <Button2 label="Wyślij" onClick={handleSendMessage} />
      </div>
    </div>
    </div>
  );
};

export default MessageView;
