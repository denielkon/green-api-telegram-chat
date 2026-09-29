const CHAT_SUFFIX = '@c.us';

const digitsOf = (value: string | null | undefined) => value?.replace(/\D/g, '') ?? '';

export const peerKey = (value: string | null | undefined) => digitsOf(value).slice(-10);

export const isSamePeer = (a: string | null | undefined, b: string | null | undefined) => {
  const key = peerKey(a);
  return key !== '' && key === peerKey(b);
};

export function toChatId(phone: string): string | null {
  const digits = digitsOf(phone);
  if (digits.length < 10) return null;

  const normalized = digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
  return `${normalized}${CHAT_SUFFIX}`;
}

export function formatPhone(chatId: string) {
  const digits = digitsOf(chatId);

  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }

  return chatId.replace(CHAT_SUFFIX, '');
}
