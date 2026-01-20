'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useEffect } from 'react';
import { loadFromStorage } from '@/store/slices/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load auth state from localStorage on mount
    store.dispatch(loadFromStorage());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

