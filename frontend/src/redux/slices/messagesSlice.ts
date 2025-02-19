import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Typy danych
export interface Message {
  messageId: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  messageContent: string;
  created_at: string;
}

export interface Conversation {
  conversationId: number;
  user1Id: number;
  user2Id: number;
  listingId?: number;
  isReadByUser1: boolean;
  isReadByUser2: boolean;
  user1: { id: number; email: string };
  user2: { id: number; email: string };
  listing?: { listingId: number; title: string };
  messages: { created_at: string }[];
}

export interface MessagesState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

// Początkowy stan
const initialState: MessagesState = {
  conversations: [],
  selectedConversation: null,
  messages: [],
  searchQuery: '',
  loading: false,
  error: null,
};

// AsyncThunks

// Pobranie listy konwersacji
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conversations/${userId}`);
      return response.data.conversations as Conversation[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Nie udało się pobrać konwersacji');
    }
  }
);
// Pobranie listy konwersacji dla listingId
export const fetchConversationsByListing = createAsyncThunk(
  'messages/fetchConversationsByListing',
  async (
    { listingId, userId }: { listingId: number; userId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/conversations/listing/${listingId}/user/${userId}`
      );
      return response.data.conversations as Conversation[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Nie udało się pobrać konwersacji dla ogłoszenia');
    }
  }
);

// Pobranie wiadomości dla wybranej konwersacji
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conversations/${conversationId}/messages`);
      return response.data.messages as Message[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Nie udało się pobrać wiadomości');
    }
  }
);

// Oznaczenie konwersacji jako przeczytanej
export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async ({ conversationId, userId }: { conversationId: number; userId: number }, { rejectWithValue }) => {
    try {
      await axios.put(`http://localhost:5000/api/conversations/${conversationId}/read`, { userId });
      return { conversationId, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Nie udało się oznaczyć wiadomości jako przeczytanej');
    }
  }
);

// Wysłanie nowej wiadomości
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (
    { senderId, receiverId, listingId, messageContent }: { senderId: number; receiverId: number; listingId?: number; messageContent: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('http://localhost:5000/api/conversations/message', {
        senderId,
        receiverId,
        listingId,
        messageContent,
      });
      return response.data as { conversation: Conversation; newMessage: Message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Nie udało się wysłać wiadomości');
    }
  }
);


// Slice
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearSelectedConversation(state) {
      state.selectedConversation = null;
      state.messages = [];
    },
    setSelectedConversation(state, action: PayloadAction<Conversation>) {
      state.selectedConversation = action.payload;
      state.messages = []; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
        state.conversations = action.payload;
        state.loading = false;
      })
      .addCase(fetchConversations.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchConversationsByListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationsByListing.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
        state.conversations = action.payload;
        state.loading = false;
      })
      .addCase(fetchConversationsByListing.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action: PayloadAction<{ conversationId: number; userId: number }>) => {
        const { conversationId, userId } = action.payload;
        const conversation = state.conversations.find((conv) => conv.conversationId === conversationId);
        if (conversation) {
          if (conversation.user1Id === userId) conversation.isReadByUser1 = true;
          if (conversation.user2Id === userId) conversation.isReadByUser2 = true;
        }
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<{ conversation: Conversation; newMessage: Message }>) => {
        const { conversation, newMessage } = action.payload;
      
        // Dodaj nową wiadomość do listy `messages`
        state.messages.push(newMessage);
      
        // Znajdź odpowiednią konwersację
        const existingConversation = state.conversations.find(
          (conv) => conv.conversationId === conversation.conversationId
        );
      
        if (existingConversation) {
          // Aktualizuj istniejącą konwersację
          existingConversation.isReadByUser1 = conversation.isReadByUser1;
          existingConversation.isReadByUser2 = conversation.isReadByUser2;
          existingConversation.messages.push({ created_at: newMessage.created_at });
        } else {
          // Jeśli konwersacja nie istnieje, dodaj nową
          state.conversations.push({
            ...conversation,
            messages: [{ created_at: newMessage.created_at }],
          });
        }
      });
      
  },
});

// Eksport akcji i reduktora
export const { setSearchQuery, clearSelectedConversation, setSelectedConversation } = messagesSlice.actions;
export default messagesSlice.reducer;
