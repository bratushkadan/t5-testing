import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { BeatLoader } from 'react-spinners';
import { useQuery } from '@tanstack/react-query';

import { API_BASE_URL } from '../consts';
import { useUiStateStore, useUserDataStore, useAuthStore, useBirthdaysDataStore } from '../stores';

export const AddBirthdayModal: React.FC = () => {
  const showAddBirthdayModal = useUiStateStore((state) => state.showAddBirthdayModal);
  const handleCloseAddBirthdayModal = useUiStateStore((state) => state.handleCloseAddBirthdayModal);

  const token = useAuthStore((state) => state.token);
  const username = useUserDataStore((state) => state.username);
  const addBirthday = useBirthdaysDataStore((state) => state.addBirthday);

  const [friendName, setFriendName] = useState('');
  const [date, setDate] = useState<null | string>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    setIsValidated(false);
  }, [friendName, date]);

  const {
    isFetched,
    isFetching,
    error,
    data: addedBirthdayData,
  } = useQuery<any, Error, { date: number; user_id: number; friend_name: string; time_created: number }>({
    queryKey: ['addBirthday'],
    enabled: token !== undefined && isValidated,
    retry: false,
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/birthday?${new URLSearchParams({
          token: token as string,
          username: username as string,
          friend_name: friendName,
          date: String(dayjs(date).valueOf()),
        })}`,
        {
          method: 'POST',
        }
      );
      const data: { error: string } = await response.json();

      if (response.status < 400) {
        return data;
      }

      throw new Error(data.error);
    },
  });

  useEffect(() => {
    if (error !== null) {
      setValidationErrors((errors) => [...errors, error.message]);
    }
  }, [error]);

  useEffect(() => {
    if (isFetched && addedBirthdayData) {
      addBirthday(addedBirthdayData);
      handleCloseAddBirthdayModal();
      setFriendName('');
      setDate(null);
    }
  }, [addedBirthdayData, isFetched]);

  const validateData = useCallback(() => {
    const errors = [];
    if (friendName.length === 0) {
      errors.push('Имя друга не может быть пустым');
    } else if (friendName.length > 70) {
      errors.push('Имя друга не может быть больше длины 70');
    }

    if (date === null) {
      errors.push('Дата рождения должна быть выставлена');
    } else if (date !== null) {
      const parsedDate = dayjs(date);
      if (!parsedDate.isValid()) {
        errors.push('Введена невалидная дата рождения');
      }
    }

    setValidationErrors(errors);

    if (errors.length === 0) {
      setIsValidated(true);
    }
  }, [friendName, date, setValidationErrors]);

  useEffect(() => {
    setValidationErrors([]);
  }, [friendName, date]);

  return (
    <>
      <Modal show={showAddBirthdayModal} onHide={handleCloseAddBirthdayModal}>
        <Modal.Header closeButton>
          <>
            <Modal.Title>Добавить день рождения</Modal.Title>
          </>
        </Modal.Header>
        {!isFetching ? null : (
          <div style={{ marginTop: '.75rem', display: 'flex', justifyContent: 'center' }}>
            <BeatLoader color="#36d7b7" size="20" />
          </div>
        )}
        <Modal.Body>
          <>
            {validationErrors.map((error, i) => (
              <Alert variant="danger" key={i}>
                {error}
              </Alert>
            ))}
          </>
          <Form.Label htmlFor="inputFriendName">Имя друга</Form.Label>
          <Form.Control
            type="text"
            id="inputFriendName"
            value={friendName}
            onChange={(e) => setFriendName(e.currentTarget.value)}
          />
          <Form.Label htmlFor="inputDate">Дата рождения</Form.Label>
          <Form.Control
            type="date"
            id="inputDate"
            value={date || ''}
            onChange={(e) => setDate(e.currentTarget.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddBirthdayModal}>
            Закрыть
          </Button>
          <Button variant="primary" onClick={validateData}>
            Отправить данные
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
