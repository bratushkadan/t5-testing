import { create } from 'zustand';

import type { Birthday } from '../types';

export const useUiStateStore = create<{
  showSignInModal: boolean;
  handleCloseSignInModal: () => void;
  handleOpenSignInModal: () => void;

  showAddBirthdayModal: boolean;
  handleCloseAddBirthdayModal: () => void;
  handleOpenAddBirthdayModal: () => void;
}>((set) => ({
  showSignInModal: false,
  handleCloseSignInModal: () => set(() => ({ showSignInModal: false })),
  handleOpenSignInModal: () => set(() => ({ showSignInModal: true })),
  showAddBirthdayModal: false,
  handleCloseAddBirthdayModal: () => set(() => ({ showAddBirthdayModal: false })),
  handleOpenAddBirthdayModal: () => set(() => ({ showAddBirthdayModal: true })),
}));

export const useFormDataStore = create<{
  username: string;
  password: string;
  validated: boolean;
  setValidated: (validated: boolean) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
}>((set) => ({
  username: '',
  password: '',
  validated: false,
  setValidated: (validated: boolean) => set({ validated }),
  setUsername: (username: string) => set({ username, validated: false }),
  setPassword: (password: string) => set({ password, validated: false }),
}));

export const useUserDataStore = create<{
  id: number | undefined;
  username: string | undefined;
  setId: (id: number | undefined) => void;
  setUsername: (username: string | undefined) => void;
}>((set) => ({
  username: undefined,
  id: undefined,
  setUsername: (username) => set(() => ({ username })),
  setId: (id) => set(() => ({ id })),
}));

export const useBirthdaysDataStore = create<{
  birthdays: Birthday[];
  setBirthdays: (birthdays: Birthday[]) => void;
  addBirthday: (birthday: Birthday) => void;
  removeBirthdayByFriendName: (friendName: string) => void;
}>((set) => ({
  birthdays: [],
  setBirthdays: (birthdays) => set(() => ({ birthdays })),
  addBirthday: (birthday) =>
    set((state) => ({
      birthdays: [...state.birthdays.filter((bd) => bd.friend_name != birthday.friend_name), birthday],
    })),
  removeBirthdayByFriendName: (friendName) =>
    set((state) => ({ birthdays: state.birthdays.filter((birthday) => birthday.friend_name !== friendName) })),
}));

export const useAuthStore = create<{
  token: string | undefined;
  setToken: (token: string) => void;
  flushToken: () => void;
}>((set) => ({
  token: undefined,
  setToken: (token: string) => set((state) => ({ token })),
  flushToken: () => set((state) => ({ token: undefined })),
}));
