import { PersonIcon } from '../../icons';
import styles from './Avatar.module.css';

export default function Avatar() {
  return (
    <div className={styles.avatar}>
      <PersonIcon />
    </div>
  );
}
