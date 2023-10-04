import { useState, useEffect, useCallback } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { BeatLoader } from 'react-spinners';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/shallow';

import { API_BASE_URL } from '../consts';
import { useUiStateStore, useAuthStore, useFormDataStore } from '../stores';
import { getDefaultValidationErrors } from '../utils';

export const SignInModal: React.FC = () => {
  const showSignInModal = useUiStateStore((state) => state.showSignInModal);
  const handleCloseSignInModalStore = useUiStateStore((state) => state.handleCloseSignInModal);

  const { username, password, validated } = useFormDataStore(
    useShallow((state) => ({ username: state.username, password: state.password, validated: state.validated }))
  );
  const setUsername = useFormDataStore((state) => state.setUsername);
  const setPassword = useFormDataStore((state) => state.setPassword);
  const setValidated = useFormDataStore((state) => state.setValidated);

  const setToken = useAuthStore((state) => state.setToken);

  const {
    isFetched,
    isFetching,
    error,
    data: authData,
  } = useQuery<any, { message: string }, { token: string; id: number; username: string }>({
    queryKey: ['authToken'],
    enabled: validated,
    retry: false,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/token?${new URLSearchParams({ username, password })}`);
      const data: { error: string } = await response.json();

      if (response.status < 400) {
        return data;
      }

      throw new Error(data.error);
    },
  });

  const [validationErrors, setValidationErrors] = useState(getDefaultValidationErrors());

  useEffect(() => {
    if (isFetched && authData) {
      setToken(authData.token);
      handleCloseSignInModal();
    }
  }, [authData, setToken, isFetched]);

  const validateLoginData = () => {
    const errors = getDefaultValidationErrors();
    const un = username.trim();
    const pass = password.trim();

    if (un.length < 3) {
      errors.username.push('Длина имени пользователя не может быть меньше 4.');
    }
    if (pass.length === 0) {
      errors.password.push('Пароль не может быть пустым.');
    }

    setValidationErrors(errors);

    if (errors.username.length === 0 && errors.password.length === 0) {
      setValidated(true);
    }
  };

  const handleCloseSignInModal = () => {
    setValidationErrors(getDefaultValidationErrors());
    handleCloseSignInModalStore();
  };

  return (
    <>
      <Modal show={showSignInModal} onHide={handleCloseSignInModal}>
        <Modal.Header closeButton>
          <>
            <Modal.Title>Войти в учетную запись</Modal.Title>
          </>
        </Modal.Header>
        {!isFetching ? null : (
          <div style={{ marginTop: '.75rem', display: 'flex', justifyContent: 'center' }}>
            <BeatLoader color="#36d7b7" size="20" />
          </div>
        )}
        <Modal.Body>
          {validated && error && <Alert variant="danger">{error.message}</Alert>}
          {validationErrors.username.length > 0 ? (
            <Alert variant="danger">{validationErrors.username.join('\n')}</Alert>
          ) : null}
          <Form.Label htmlFor="inputUsername">Имя пользователя</Form.Label>
          <Form.Control
            type="text"
            id="inputUsername"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          {validationErrors.password.length > 0 ? (
            <Alert variant="danger">{validationErrors.password.join('\n')}</Alert>
          ) : null}
          <Form.Label htmlFor="inputPassword">Пароль</Form.Label>
          <Form.Control
            type="password"
            id="inputPassword"
            aria-describedby="passwordHelpBlock"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSignInModal}>
            Закрыть
          </Button>
          <Button variant="primary" onClick={validateLoginData}>
            Отправить данные
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
