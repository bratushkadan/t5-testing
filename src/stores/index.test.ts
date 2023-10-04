import { Birthday } from '../types';
import { useFormDataStore, useBirthdaysDataStore } from './';

import { renderHook, act } from '@testing-library/react';

describe('test zustand stores that implement client-side logic', () => {
  describe('formDataStore', () => {
    it('should handle state update for entered input', () => {
      // GIVEN
      const enteredUsername = 'bratushkadan';
      const enteredPassword = 'password123';
      const { result } = renderHook(() => useFormDataStore((state) => state));

      // WHEN
      act(() => enterCredentials(result, { enteredUsername, enteredPassword }));

      // THEN
      expect(result.current.username).toBe(enteredUsername);
    });

    it('should reset validation flag if something was entered after the validation', () => {
      // GIVEN
      const { result } = renderHook(() => useFormDataStore((state) => state));
      act(() => result.current.setValidated(true));

      // WHEN
      act(() => result.current.setUsername(result.current.username + 'abc'));

      // THEN
      expect(result.current.validated).toBe(false);
    });
  });

  describe('birthdaysDataStore', () => {
    describe('handle add birthday to the list', () => {
      it('should add a birthday for a friend of given name if it is not present in the list', () => {
        // GIVEN
        const FRIEND_NAME = 'Danila Bratushka';
        const birthdayRecord = getBirthdayForName(FRIEND_NAME);
        const { result } = renderHook(() => useBirthdaysDataStore((state) => state));

        // WHEN
        act(() => result.current.addBirthday(birthdayRecord));

        // THEN
        expect(result.current.birthdays).toEqual([birthdayRecord]);
      });
      it('should not add a birthday for a friend of given name if it is present in the list', () => {
        // GIVEN
        const FRIEND_NAME = 'Danila Bratushka';
        const birthdays: Birthday[] = [getBirthdayForName(FRIEND_NAME)];
        const { result } = renderHook(() => useBirthdaysDataStore((state) => state));
        act(() => result.current.setBirthdays(birthdays));

        // WHEN
        act(() => result.current.addBirthday(getBirthdayForName(FRIEND_NAME)));

        // THEN
        expect(result.current.birthdays).toEqual(birthdays);
      });
    });
    describe('handle remove birthday from the list', () => {
      it('should not remove any birthdays if the birthday that was asked to be removed is absent', () => {
        // GIVEN
        const FRIEND_NAME = 'Danila Bratushka';
        const FRIEND_NAME2 = 'Vladislav Nasevich';
        const birthdays: Birthday[] = [getBirthdayForName(FRIEND_NAME)];
        const { result } = renderHook(() => useBirthdaysDataStore((state) => state));
        act(() => result.current.setBirthdays(birthdays));

        // WHEN
        act(() => result.current.removeBirthdayByFriendName(FRIEND_NAME2));

        // THEN
        expect(result.current.birthdays).toEqual(birthdays);
      });
      it('should remove all birthdays that are present in the list', () => {
        // GIVEN
        const FRIEND_NAME = 'Danila Bratushka';
        const FRIEND_NAME2 = 'Vladislav Nasevich';
        const birthdays: Birthday[] = [getBirthdayForName(FRIEND_NAME2), getBirthdayForName(FRIEND_NAME)];
        const { result } = renderHook(() => useBirthdaysDataStore((state) => state));
        act(() => result.current.setBirthdays(birthdays));

        // WHEN
        act(() => result.current.removeBirthdayByFriendName(FRIEND_NAME2));

        // THEN
        expect(result.current.birthdays).toEqual([getBirthdayForName(FRIEND_NAME)]);
      });
    });
  });
});

function enterCredentials(
  result: any,
  { enteredUsername, enteredPassword }: { enteredUsername: string; enteredPassword: string }
) {
  const { setUsername, setPassword } = result.current;
  setUsername(enteredUsername);
  setPassword(enteredPassword);
}

function getBirthdayForName(name: string): Birthday {
  return {
    user_id: 1,
    friend_name: name,
    date: 0,
    time_created: 0,
  };
}

function getFriendNamesFromBirthdays(birthdays: Birthday[]) {
  return birthdays.map((birthday) => birthday.friend_name);
}
