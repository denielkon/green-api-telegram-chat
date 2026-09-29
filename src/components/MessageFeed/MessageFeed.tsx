import { useEffect, useRef } from 'react';

import { formatTime, messageText } from '../../helpers';
import type { Message } from '../../types';
import styles from './MessageFeed.module.css';

type Props = {
  messages: Message[];
};

export default function MessageFeed({ messages }: Props) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) {
      feed.scrollTop = feed.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={styles.feed}
      ref={feedRef}
      role="log"
      aria-live="polite"
      aria-label="Сообщения"
      tabIndex={0}
    >
      {messages.length === 0 && (
        <p className={styles.hint}>Напишите первое сообщение — оно уйдёт в Telegram</p>
      )}

      {messages.map((message) => (
        <article
          key={message.id}
          className={message.outgoing ? styles.bubbleOut : styles.bubbleIn}
          aria-label={message.outgoing ? 'Исходящее' : 'Входящее'}
        >
          <span className={message.unsupported ? styles.unsupported : styles.text}>
            {messageText(message)}
          </span>
          <time className={styles.time} dateTime={new Date(message.at).toISOString()}>
            {formatTime(message.at)}
          </time>
        </article>
      ))}
    </div>
  );
}
