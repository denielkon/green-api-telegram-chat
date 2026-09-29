import {
  useEffect,
  useImperativeHandle,
  useRef,
  type FormEvent,
  type KeyboardEvent,
  type Ref,
} from 'react';

import { SendIcon } from '../../icons';
import styles from './Composer.module.css';

export type ComposerHandle = {
  focus: () => void;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  ref?: Ref<ComposerHandle>;
};

const MAX_HEIGHT = 140;

export default function Composer({ value, onChange, onSend, sending, ref }: Props) {
  const area = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => area.current?.focus() }), []);

  useEffect(() => {
    const element = area.current;
    if (!element) return;

    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSend();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <form className={styles.composer} onSubmit={submit}>
      <textarea
        ref={area}
        value={value}
        rows={1}
        placeholder="Сообщение"
        aria-label="Сообщение"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button type="submit" disabled={sending || !value.trim()} aria-label="Отправить">
        <SendIcon />
      </button>
    </form>
  );
}
