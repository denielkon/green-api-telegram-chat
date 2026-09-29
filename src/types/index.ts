export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
};

export type Message = {
  id: string;
  text: string;
  outgoing: boolean;
  at: number;
  author?: string;
  unsupported?: boolean;
};

export type Chat = {
  id: string;
  name?: string;
  preview?: string;
  at?: number;
  unread: number;
};

export type IncomingNotification = {
  receiptId: number;
  body: {
    typeWebhook: string;
    timestamp?: number;
    idMessage?: string;
    senderData?: {
      chatId?: string;
      chatName?: string;
      senderName?: string;
      senderContactName?: string;
      senderPhoneNumber?: number | string;
    };
    messageData?: {
      textMessageData?: { textMessage?: string };
      extendedTextMessageData?: { text?: string };
    };
  };
};

export type IncomingMessage = {
  from?: string;
  message: Message;
};
