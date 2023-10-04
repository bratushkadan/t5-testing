import { useUserDataStore } from '../stores';

import { SignInButton } from './SignInButton';

export const AppNavigation: React.FC = () => {
  const username = useUserDataStore((state) => state.username);

  return (
    <nav>
      <header className="header">Дни рождения{username ? ` друзей ${username}` : ''}</header>
      <div className="login-section">
        <SignInButton />
      </div>
    </nav>
  );
};
