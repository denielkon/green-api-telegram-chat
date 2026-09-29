import { useEffect, useRef, useState, type MouseEvent } from 'react';

import { ApiError, sendMessage } from '../../api';
import { ChatSidebar, Composer, MessageFeed, type ComposerHandle } from '../../components';
import {
  findChatId,
  formatPhone,
  isSamePeer,
  loadChat,
  loadChats,
  loadMessages,
  readChat,
  saveChat,
  saveChats,
  saveMessages,
  touchChat,
} from '../../helpers';
import { useIncoming } from '../../hooks';
import { MenuIcon } from '../../icons';
import type { Chat as ChatEntry, Credentials, Message } from '../../types';
import { Avatar } from '../../ui';
import styles from './Chat.module.css';

function restoreChats() {
  const chats = loadChats();
  const active = loadChat();

  if (!active || chats.some((chat) => chat.id === active)) return chats;

  return touchChat(chats, active, loadMessages(active).at(-1));
}

type Props = {
  credentials: Credentials;
  onLogout: () => void;
};

export default function Chat({ credentials, onLogout }: Props) {
  const [chats, setChats] = useState<ChatEntry[]>(restoreChats);
  const [chatId, setChatId] = useState(loadChat);
  const [messages, setMessages] = useState<Message[]>(() => (chatId ? loadMessages(chatId) : []));
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const composer = useRef<ComposerHandle>(null);

  const connected = useIncoming(credentials, {
    onMessage: (from, message) => {
      const target = findChatId(chats, from);
      if (!target) return;

      const active = isSamePeer(target, chatId);

      if (active) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      } else {
        const stored = loadMessages(target);

        if (!stored.some((m) => m.id === message.id)) {
          saveMessages(target, [...stored, message]);
        }
      }

      setChats((prev) => touchChat(prev, target, message, !active));
    },
    onAuthError: onLogout,
  });

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    if (chatId) {
      composer.current?.focus();
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      saveMessages(chatId, messages);
    }
  }, [chatId, messages]);

  useEffect(() => {
    if (!panelOpen) return;

    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPanelOpen(false);
      }
    }

    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [panelOpen]);

  function openChat(id: string) {
    setChatId(id);
    setMessages(loadMessages(id));
    setChats((prev) => readChat(prev, id));
    saveChat(id);
    setError('');
    setPanelOpen(false);
  }

  function createChat(id: string) {
    setChats((prev) => touchChat(prev, id));
    openChat(id);
  }

  async function send() {
    const text = draft.trim();
    if (!text || !chatId || sending) return;

    setSending(true);

    try {
      const idMessage = await sendMessage(credentials, chatId, text);
      const message: Message = { id: idMessage, text, outgoing: true, at: Date.now() };

      setMessages((prev) => [...prev, message]);
      setChats((prev) => touchChat(prev, chatId, message));
      setDraft('');
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Сообщение не отправилось');
    } finally {
      setSending(false);
    }
  }

  function focusComposer(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button, a, input, textarea')) return;

    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;

    composer.current?.focus();
  }

  const current = chats.find((chat) => chat.id === chatId);
  const phone = chatId ? formatPhone(chatId) : '';
  const title = current?.name ?? phone;
  const subtitle = connected ? (title === phone ? '' : phone) : 'соединение…';

  return (
    <div className={styles.layout}>
      <ChatSidebar
        chats={chats}
        activeId={chatId}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onOpenChat={openChat}
        onCreateChat={createChat}
        onError={setError}
        onLogout={onLogout}
      />

      {panelOpen && (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="Закрыть список чатов"
          onClick={() => setPanelOpen(false)}
        />
      )}

      <main className={styles.main} onClick={focusComposer}>
        {chatId ? (
          <>
            <header className={styles.header}>
              <button
                className={styles.menu}
                type="button"
                aria-label="Список чатов"
                aria-expanded={panelOpen}
                aria-controls="chats"
                onClick={() => setPanelOpen(true)}
              >
                <MenuIcon />
              </button>

              <Avatar />

              <div className={styles.headerText}>
                <div className={styles.headerName}>{title}</div>
                {subtitle && <div className={styles.headerStatus}>{subtitle}</div>}
              </div>
            </header>

            <MessageFeed messages={messages} />

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <Composer
              ref={composer}
              value={draft}
              onChange={setDraft}
              onSend={send}
              sending={sending}
            />
          </>
        ) : (
          <div className={styles.empty}>
            <p>Выберите чат или добавьте новый номер</p>
            {error && (
              <p className={styles.emptyError} role="alert">
                {error}
              </p>
            )}
            <button className={styles.emptyAction} type="button" onClick={() => setPanelOpen(true)}>
              Выбрать чат
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
