import { Button } from 'react-bootstrap';

import { useUiStateStore, useAuthStore } from '../stores';

export const SignInButton: React.FC = () => {
  const handleOpenSignInModal = useUiStateStore((state) => state.handleOpenSignInModal);

  const authToken = useAuthStore((state) => state.token);

  return (
    <>
      {authToken ? null : (
        <Button variant="primary" onClick={handleOpenSignInModal}>
          Войти
        </Button>
      )}
    </>
  );
};
