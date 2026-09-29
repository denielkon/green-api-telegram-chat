import { useState } from 'react';

import { clearSession, loadCredentials, saveCredentials } from './helpers';
import { Chat, Login } from './pages';
import type { Credentials } from './types';

export default function App() {
  const [credentials, setCredentials] = useState(loadCredentials);

  function logIn(creds: Credentials) {
    saveCredentials(creds);
    setCredentials(creds);
  }

  function logOut() {
    clearSession();
    setCredentials(null);
  }

  if (!credentials) {
    return <Login onSuccess={logIn} />;
  }

  return <Chat credentials={credentials} onLogout={logOut} />;
}
