import React, { createContext, useContext, useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';

const ConfirmationContext = createContext();

export const ConfirmationProvider = ({ children }) => {
  const { theme } = useThemeStore();
  const [confirmation, setConfirmation] = useState({
    message: '',
    isOpen: false,
    onConfirm: () => {},
  });

  const requestConfirmation = (message) =>
    new Promise((resolve) => {
      setConfirmation({
        message,
        isOpen: true,
        onConfirm: (result) => {
          setConfirmation({ isOpen: false });
          resolve(result);
        },
      });
    });

  return (
    <ConfirmationContext.Provider value={requestConfirmation}>
      {children}
      {confirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg shadow-lg text-center w-96 animate-fade-in ${
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'
            }`}
          >
            <p className="text-lg font-semibold mb-4">{confirmation.message}</p>
            <div className="flex justify-center gap-4">
              <button
                className={`btn btn-primary`}
                onClick={() => confirmation.onConfirm(true)}
              >
                Confirm
              </button>
              <button
                className="btn btn-neutral"
                onClick={() => confirmation.onConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => useContext(ConfirmationContext);
