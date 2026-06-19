import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAppStore } from '@/store';
import './app.scss';

function App(props) {
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
    console.log('[App] Hydrated on initial mount');
  }, [hydrateFromStorage]);

  useDidShow(() => {
    hydrateFromStorage();
    console.log('[App] useDidShow - Rehydrated from storage');
  });

  useDidHide(() => {
    const persistToStorage = useAppStore.getState().persistToStorage;
    persistToStorage();
    console.log('[App] useDidHide - Persisted to storage');
  });

  return props.children;
}

export default App;
