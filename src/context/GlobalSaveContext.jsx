import React, { createContext, useContext, useState, useCallback } from 'react';

const GlobalSaveContext = createContext();

export const GlobalSaveProvider = ({ children }) => {
  const [saveFunction, setSaveFunction] = useState(null);

  const registerSaveFunction = useCallback((callback) => {
    setSaveFunction(() => callback);
  }, []);

  const unregisterSaveFunction = useCallback(() => {
    setSaveFunction(null);
  }, []);

  const executeSave = useCallback(() => {
    if (saveFunction) {
      saveFunction();
    }
  }, [saveFunction]);

  return (
    <GlobalSaveContext.Provider value={{
      saveFunction,
      registerSaveFunction,
      unregisterSaveFunction,
      executeSave
    }}>
      {children}
    </GlobalSaveContext.Provider>
  );
};

export const useGlobalSave = () => {
  const context = useContext(GlobalSaveContext);
  if (!context) {
    throw new Error('useGlobalSave must be used within a GlobalSaveProvider');
  }
  return context;
};
