import React, { createContext, useContext, useState } from 'react';

const RepentanceModalContext = createContext(null);

export function RepentanceModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openRepentanceModal = () => setIsOpen(true);
  const closeRepentanceModal = () => setIsOpen(false);

  return (
    <RepentanceModalContext.Provider
      value={{
        isOpen,
        openRepentanceModal,
        closeRepentanceModal,
      }}
    >
      {children}
    </RepentanceModalContext.Provider>
  );
}

export function useRepentanceModal() {
  const context = useContext(RepentanceModalContext);
  if (!context) {
    // Si se utiliza fuera del provider (por ejemplo en tests aislados), fallback seguro
    return {
      isOpen: false,
      openRepentanceModal: () => {},
      closeRepentanceModal: () => {},
    };
  }
  return context;
}
