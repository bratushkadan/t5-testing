import { useEffect, useLayoutEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { BeatLoader } from 'react-spinners';
import { useShallow } from 'zustand/shallow';
import { useQuery } from '@tanstack/react-query';

import { API_BASE_URL, LOCAL_STORAGE_TOKEN_KEY } from '../consts';
import { useUserDataStore, useAuthStore } from '../stores';

export const Auth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const flushToken = useAuthStore((state) => state.flushToken);

  const { id, username } = useUserDataStore(useShallow(({ id, username }) => ({ id, username })));
  const { setId, setUsername } = useUserDataStore(useShallow(({ setId, setUsername }) => ({ setId, setUsername })));

  useLayoutEffect(() => {
    const token = window.localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (token !== null) {
      setToken(token);
    }
  }, [setToken]);

  useEffect(() => {
    if (token !== undefined) {
      window.localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
  }, [token]);

  const { isFetching, data, error } = useQuery<any, Error, { id: number; username: string }>({
    queryKey: ['userData'],
    enabled: id === undefined && username === undefined && token !== undefined,
    retry: false,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me?${new URLSearchParams({ token: token as string })}`);
      const data = (await response.json()) as { error: string };

      if (response.status < 400) {
        return data;
      }

      throw new Error(data.error);
    },
  });

  useEffect(() => {
    if (data !== undefined) {
      setId(data.id);
      setUsername(data.username);
    }
  }, [data]);

  useEffect(() => {
    if (error !== null) {
      flushToken();
    }
  }, [error]);

  return (
    <>
      {!isFetching ? null : (
        <div style={{ marginTop: '.75rem', display: 'flex', justifyContent: 'center' }}>
          <BeatLoader color="#36d7b7" size="20" />
        </div>
      )}
      {!error ? null : <Alert variant="danger">{error.message}</Alert>}
      {!token ? null : children}
    </>
  );
};
