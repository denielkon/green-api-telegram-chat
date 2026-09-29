import { useState, type FormEvent } from 'react';

import { ApiError, getStateInstance } from '../../api';
import { LogoIcon } from '../../icons';
import type { Credentials } from '../../types';
import styles from './Login.module.css';

type Props = {
  onSuccess: (credentials: Credentials) => void;
};

function describeState(state: string) {
  switch (state) {
    case 'notAuthorized':
      return 'Инстанс не авторизован — отсканируйте QR-код в консоли GREEN-API';
    case 'starting':
      return 'Инстанс ещё запускается, попробуйте через минуту';
    case 'blocked':
      return 'Инстанс заблокирован';
    default:
      return `Инстанс недоступен: ${state}`;
  }
}

export default function Login({ onSuccess }: Props) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    const credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    };

    if (!credentials.idInstance || !credentials.apiTokenInstance) {
      setError('Заполните оба поля');
      return;
    }

    setChecking(true);
    setError('');

    try {
      const state = await getStateInstance(credentials);

      if (state === 'authorized') {
        onSuccess(credentials);
        return;
      }

      setError(describeState(state));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось связаться с GREEN-API');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <div className={styles.logo}>
          <LogoIcon />
        </div>

        <h1 className={styles.title}>Вход в чат</h1>
        <p className={styles.subtitle}>
          Понадобятся данные инстанса Telegram из личного кабинета GREEN-API
        </p>

        <label className={styles.field}>
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1101000001"
            autoComplete="off"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span>apiTokenInstance</span>
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd412345"
            autoComplete="off"
          />
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button className={styles.submit} type="submit" disabled={checking}>
          {checking ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
