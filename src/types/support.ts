export interface ConversationDto {
  id: string;
  customerId: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentDto {
  id: string;
  messageId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'customer' | 'admin';
  content: string;
  attachments: AttachmentDto[];
  createdAt: string;
}
