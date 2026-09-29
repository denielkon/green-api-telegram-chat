import type { Chat, Message } from '../types';
import { messageText } from './message';
import { isSamePeer } from './phone';

export const findChatId = (chats: Chat[], peer: string | null | undefined) =>
  chats.find((chat) => isSamePeer(chat.id, peer))?.id;

export function touchChat(
  chats: Chat[],
  id: string,
  message?: Message,
  unread = false,
): Chat[] {
  const previous = chats.find((chat) => chat.id === id);

  const chat: Chat = {
    id,
    name: message?.author ?? previous?.name,
    preview: message ? messageText(message) : previous?.preview,
    at: message?.at ?? previous?.at,
    unread: unread ? (previous?.unread ?? 0) + 1 : 0,
  };

  return [chat, ...chats.filter((item) => item.id !== id)];
}

export const readChat = (chats: Chat[], id: string) =>
  chats.map((chat) => (chat.id === id ? { ...chat, unread: 0 } : chat));
