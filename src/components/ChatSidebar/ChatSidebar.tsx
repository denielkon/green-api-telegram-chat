import { useState, type FormEvent } from 'react';

import { formatPhone, formatTime, toChatId } from '../../helpers';
import { CloseIcon, LogoutIcon } from '../../icons';
import type { Chat } from '../../types';
import { Avatar } from '../../ui';
import styles from './ChatSidebar.module.css';

type Props = {
  chats: Chat[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onOpenChat: (chatId: string) => void;
  onCreateChat: (chatId: string) => void;
  onError: (message: string) => void;
  onLogout: () => void;
};

export default function ChatSidebar({
  chats,
  activeId,
  open,
  onClose,
  onOpenChat,
  onCreateChat,
  onError,
  onLogout,
}: Props) {
  const [draft, setDraft] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();

    const id = toChatId(draft);
    if (!id) {
      onError('Введите номер получателя с кодом страны');
      return;
    }

    onCreateChat(id);
    setDraft('');
  }

  return (
    <aside
      id="chats"
      className={open ? `${styles.sidebar} ${styles.open}` : styles.sidebar}
      aria-labelledby="chats-title"
    >
      <div className={styles.header}>
        <h2 className={styles.title} id="chats-title">
          Чаты
        </h2>
        <button className={styles.close} type="button" aria-label="Закрыть" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      <form className={styles.newChat} onSubmit={submit}>
        <input
          type="tel"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Номер получателя"
          aria-label="Номер получателя"
        />
        <button type="submit">Открыть чат</button>
      </form>

      <div className={styles.list}>
        {chats.length === 0 ? (
          <p className={styles.listEmpty}>Здесь появятся чаты</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              className={chat.id === activeId ? `${styles.item} ${styles.active}` : styles.item}
              type="button"
              aria-current={chat.id === activeId}
              onClick={() => onOpenChat(chat.id)}
            >
              <Avatar />
              <div className={styles.itemText}>
                <div className={styles.itemTop}>
                  <span className={styles.itemName}>{chat.name ?? formatPhone(chat.id)}</span>
                  {chat.at && <span className={styles.itemTime}>{formatTime(chat.at)}</span>}
                </div>
                <div className={styles.itemBottom}>
                  <span className={styles.itemPreview}>{chat.preview ?? 'Сообщений пока нет'}</span>
                  {chat.unread > 0 && (
                    <span className={styles.badge} aria-label={`непрочитанных: ${chat.unread}`}>
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <button className={styles.logout} type="button" onClick={onLogout}>
        <LogoutIcon />
        <span>Выйти</span>
      </button>
    </aside>
  );
}
