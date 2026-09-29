import type { Chat, Credentials, Message } from '../types';

const CREDENTIALS = 'green-api.credentials';
const CHAT = 'green-api.chat';
const CHATS = 'green-api.chats';
const messagesKey = (chatId: string) => `green-api.messages.${chatId}`;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const loadCredentials = () => read<Credentials>(CREDENTIALS);
export const saveCredentials = (creds: Credentials) => write(CREDENTIALS, creds);

export const loadChat = () => read<string>(CHAT);
export const saveChat = (chatId: string) => write(CHAT, chatId);

export const loadChats = () => read<Chat[]>(CHATS) ?? [];
export const saveChats = (chats: Chat[]) => write(CHATS, chats);

export const loadMessages = (chatId: string) => read<Message[]>(messagesKey(chatId)) ?? [];
export const saveMessages = (chatId: string, messages: Message[]) =>
  write(messagesKey(chatId), messages);

export function clearSession() {
  localStorage.removeItem(CREDENTIALS);
  localStorage.removeItem(CHAT);
}
