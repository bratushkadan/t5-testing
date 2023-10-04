import { BarLoader } from 'react-spinners';
import { Alert, Button, Table } from 'react-bootstrap';
import { useEffect, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/shallow';

import { API_BASE_URL } from '../consts';
import { useUiStateStore, useUserDataStore, useAuthStore, useBirthdaysDataStore } from '../stores';
import type { Birthday } from '../types';
import { daysUntilNextBirthday, tsToFormattedDate } from '../utils';

export const BirthdayTableRow: React.FC<Birthday & { index: number } & { handleBirthdayRemove: (e: any) => void }> = (
  props
) => {
  const daysUntilNextBd = daysUntilNextBirthday(props.date);
  console.log(daysUntilNextBd);

  return (
    <tr>
      <td>{props.index}</td>
      <td>{props.friend_name}</td>
      <td>{tsToFormattedDate(props.date)}</td>
      <td>
        {daysUntilNextBd === 0 ? (
          <span style={{ color: 'green' }}>День рождения сегодня!</span>
        ) : (
          `следующий ДР через ${daysUntilNextBd} дней`
        )}
      </td>
      <td>
        <Button variant="primary" friend-name={props.friend_name} onClick={props.handleBirthdayRemove}>
          -
        </Button>
      </td>
    </tr>
  );
};

export const Birthdays: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const username = useUserDataStore((state) => state.username);
  const userId = useUserDataStore((state) => state.id);

  const handleOpenAddBirthdayModal = useUiStateStore((state) => state.handleOpenAddBirthdayModal);

  const birthdays = useBirthdaysDataStore((state) => state.birthdays);
  const { setBirthdays, removeBirthdayByFriendName } = useBirthdaysDataStore(
    useShallow((state) => ({
      setBirthdays: state.setBirthdays,
      removeBirthdayByFriendName: state.removeBirthdayByFriendName,
    }))
  );

  const { isFetching, data, error } = useQuery<any, { error: string }, Birthday[]>({
    queryKey: ['userFriendsBirthdays'],
    enabled: Boolean(birthdays.length === 0 && token && userId),
    retry: false,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/birthdays?${new URLSearchParams({ token: token as string })}`);
      const data: { error: string } = await response.json();

      if (response.status < 400) {
        return data;
      }

      throw new Error(data.error);
    },
  });

  useEffect(() => {
    if (data !== undefined) {
      setBirthdays(data);
    }
  }, [data]);

  const handleBirthdayRemove = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const friendName = e.currentTarget.getAttribute('friend-name');
      if (!friendName) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/birthday?${new URLSearchParams({
          token: token as string,
          username: username as string,
          friend_name: friendName as string,
        })}`,
        {
          method: 'DELETE',
        }
      );
      const responseData = await response.json();
      if (response.status < 400) {
        removeBirthdayByFriendName((responseData as Birthday).friend_name);
        return;
      }
      alert('Ошибка: ' + (responseData as { error: string }).error);
    },
    [token, userId]
  );

  return (
    <>
      {!isFetching ? null : (
        <div style={{ marginTop: '.75rem', display: 'flex', justifyContent: 'center' }}>
          <BarLoader color="#36d7b7" height={8} width={375} speedMultiplier={1.2} />
        </div>
      )}
      {!error ? null : <Alert>{error.error}</Alert>}
      {birthdays.length > 0 && (
        <>
          <Table striped bordered hover size="sm" style={{ maxWidth: '80vw', margin: '0 auto' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Имя</th>
                <th>День рождения</th>
                <th>Когда следующий</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {birthdays.map((birthday, i) => {
                return (
                  <BirthdayTableRow
                    {...birthday}
                    index={i}
                    handleBirthdayRemove={handleBirthdayRemove}
                    key={birthday.friend_name}
                  />
                );
              })}
            </tbody>
          </Table>
        </>
      )}
                <Button
            variant="success"
            style={{ marginTop: '.5rem', fontSize: '1.2rem', width: '200px' }}
            onClick={handleOpenAddBirthdayModal}
          >
            +
          </Button>
    </>
  );
};
