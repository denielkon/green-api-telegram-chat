import { useEffect, useRef, useState } from 'react';

import { deleteNotification, isAuthError, receiveNotification } from '../api';
import { parseIncoming } from '../helpers';
import type { Credentials, Message } from '../types';

type Handlers = {
  onMessage: (from: string | undefined, message: Message) => void;
  onAuthError: () => void;
};

const RETRY_DELAY = 3000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useIncoming(credentials: Credentials, handlers: Handlers) {
  const [connected, setConnected] = useState(true);

  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const controller = new AbortController();
    let running = true;

    async function poll() {
      while (running) {
        try {
          const notification = await receiveNotification(credentials, controller.signal);
          setConnected(true);

          if (!notification) continue;

          await deleteNotification(credentials, notification.receiptId);

          const incoming = parseIncoming(notification);
          if (!incoming) continue;

          latest.current.onMessage(incoming.from, incoming.message);
        } catch (error) {
          if (controller.signal.aborted) return;

          if (isAuthError(error)) {
            latest.current.onAuthError();
            return;
          }

          setConnected(false);
          await wait(RETRY_DELAY);
        }
      }
    }

    poll();

    return () => {
      running = false;
      controller.abort();
    };
  }, [credentials]);

  return connected;
}
