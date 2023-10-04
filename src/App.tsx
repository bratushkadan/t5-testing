import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AddBirthdayModal, Auth, AppNavigation, Birthdays, SignInModal } from './components';
import { queryClient } from './query';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <div className="App-container">
          <AppNavigation />
          <Auth>
            <>
              <Birthdays />
            </>
          </Auth>
        </div>
        <SignInModal />
        <AddBirthdayModal />
      </div>
    </QueryClientProvider>
  );
}

export default App;
