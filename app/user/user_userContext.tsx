import React, { createContext, useContext, useState } from 'react';

type UserData = {
  name: string;
  phone: string;
  email: string;
  home: string;
  work: string;
  setUserData: (data: Partial<UserData>) => void;
};

const UserContext = createContext<UserData | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserDataState] = useState({
    name: 'Carlos Alfredo Portillo Ayala',
    phone: '+1 469-490-5816',
    email: 'alfay1980@hotmail.com',
    home: '',
    work: '',
  });

  const setUserData = (data: Partial<UserData>) => {
    setUserDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <UserContext.Provider value={{ ...userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de UserProvider');
  return ctx;
}; 