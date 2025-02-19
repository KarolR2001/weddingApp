import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConversations,
  fetchConversationsByListing,
  clearSelectedConversation,
} from '../../redux/slices/messagesSlice';
import ConversationList from './ConversationList';
import MessageView from './MessageView';
import { RootState, AppDispatch } from '../../redux/store';
import styles from '../../styles/MessageComponent/MessageComponent.module.css';

const MessageComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const activeComponent = useSelector((state: RootState) => state.activeComponent.component);
  const selectedListingId = useSelector(
    (state: RootState) => state.activeComponent.selectedListingId
  );

  useEffect(() => {
    if (userId) {
      if (activeComponent === 'detailMessages' && selectedListingId) {
        // Pobierz konwersacje dla wybranego ogłoszenia
        dispatch(fetchConversationsByListing({ userId, listingId: selectedListingId }));
      } else {
        // Pobierz wszystkie konwersacje
        dispatch(fetchConversations(userId));
      }
    }

    return () => {
      dispatch(clearSelectedConversation());
    };
  }, [dispatch, userId, activeComponent, selectedListingId]);

  return (
    <div className={styles.messageComponent}>
      <div className={styles.conversationList}>
        <ConversationList />
      </div>
      <div className={styles.messageView}>
        <MessageView />
      </div>
    </div>
  );
};

export default MessageComponent;
