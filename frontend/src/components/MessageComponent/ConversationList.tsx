import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery } from '../../redux/slices/messagesSlice';
import ConversationItem from './ConversationItem';
import { RootState } from '../../redux/store';
import styles from '../../styles/MessageComponent/ConversationList.module.css';

const ConversationList: React.FC = () => {
  const dispatch = useDispatch();
  const { conversations, searchQuery } = useSelector((state: RootState) => state.messages);
  const [search, setSearch] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    dispatch(setSearchQuery(e.target.value));
  };

  const filteredConversations = conversations.filter((conv) =>
    (conv.user1.email.includes(search) || conv.user2.email.includes(search) || conv.listing?.title?.includes(search))
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <input
          type="text"
          placeholder="Szukaj konwersacji"
          value={search}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.conversationHeader}>
        <div className={styles.icon}></div>
        <div className={styles.title}>Konwersacje ({filteredConversations.length})</div>
      </div>
      <div className={styles.conversations}>
        {filteredConversations.map((conv) => (
          <ConversationItem key={conv.conversationId} conversation={conv} />
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
