import type { Credentials, IncomingNotification } from '../types';
import { endpoint, request } from './client';

export async function getStateInstance(creds: Credentials): Promise<string> {
  const data = await request(endpoint(creds, 'getStateInstance'));
  return data?.stateInstance ?? 'unknown';
}

export async function sendMessage(creds: Credentials, chatId: string, message: string) {
  const data = await request(endpoint(creds, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });

  return data.idMessage as string;
}

export async function receiveNotification(
  creds: Credentials,
  signal?: AbortSignal,
): Promise<IncomingNotification | null> {
  return request(endpoint(creds, 'receiveNotification', '?receiveTimeout=20'), { signal });
}

export function deleteNotification(creds: Credentials, receiptId: number) {
  return request(endpoint(creds, 'deleteNotification', `/${receiptId}`), { method: 'DELETE' });
}
