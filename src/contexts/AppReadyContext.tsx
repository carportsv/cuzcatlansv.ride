import React, { createContext, useContext, useState } from 'react';

const AppReadyContext = createContext<{ appIsReady: boolean, setAppIsReady: (ready: boolean) => void }>({
  appIsReady: false,
  setAppIsReady: () => {},
});

export const useAppReady = () => useContext(AppReadyContext);

export const AppReadyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appIsReady, setAppIsReadyState] = useState(false);

  const setAppIsReady = (ready: boolean) => {
    console.log('[AppReady] setAppIsReady:', ready, 'actual:', appIsReady);
    if (appIsReady !== ready) {
      setAppIsReadyState(ready);
    } else {
      console.log('[AppReady] Estado ya es', ready, ', no se actualiza');
    }
  };

  console.log('[AppReady] Render:', { appIsReady });

  return (
    <AppReadyContext.Provider value={{ appIsReady, setAppIsReady }}>
      {children}
    </AppReadyContext.Provider>
  );
}; 