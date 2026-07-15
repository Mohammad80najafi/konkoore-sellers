export interface MessageUser {
  _id: string;
  name: string;
  avatar: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: MessageUser;
  content: string;
  image: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationListing {
  _id: string;
  title: string;
  author: string;
  coverUrl: string;
}

export interface ConversationSummary {
  _id: string;
  otherUser?: MessageUser;
  listing?: ConversationListing;
  lastMessage?: ChatMessage;
  updatedAt: string;
}

export interface UserSearchResult extends MessageUser {
  phone: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  image?: string;
}

export interface SocketResult {
  ok: boolean;
  message?: ChatMessage;
  error?: string;
}
