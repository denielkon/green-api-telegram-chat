import type { IncomingMessage, IncomingNotification } from '../types';

const CUSTOM_EMOJI = /custom_emoji_\d+/g;

const NOT_PRIVATE = ['@g.us', '@newsletter', '@broadcast'];

export function parseIncoming(
  notification: IncomingNotification
): IncomingMessage | null {
  const { typeWebhook, senderData, messageData, idMessage, timestamp } = notification.body;
  if (typeWebhook !== 'incomingMessageReceived') return null;

  const chatId = senderData?.chatId;
  if (chatId && NOT_PRIVATE.some((suffix) => chatId.endsWith(suffix))) return null;

  const raw = messageData?.textMessageData?.textMessage ?? messageData?.extendedTextMessageData?.text;
  if (!raw) return null;

  const stripped = raw.replace(CUSTOM_EMOJI, ' ');
  const text = stripped.replace(/\s+/g, ' ').trim();
  if (!text && stripped === raw) return null;

  const from = senderData?.senderPhoneNumber ?? chatId;

  return {
    from: from === undefined ? undefined : String(from),
    message: {
      id: idMessage ?? String(notification.receiptId),
      text,
      outgoing: false,
      at: timestamp ? timestamp * 1000 : Date.now(),
      author: senderData?.senderContactName || senderData?.senderName || senderData?.chatName,
      unsupported: !text,
    },
  };
}
