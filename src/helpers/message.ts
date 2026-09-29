import type { Message } from '../types';

const UNSUPPORTED_TEXT = 'Формат сообщения не поддерживается';

export const messageText = (message: Message) =>
  message.unsupported ? UNSUPPORTED_TEXT : message.text;
