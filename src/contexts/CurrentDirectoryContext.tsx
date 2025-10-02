import React, { createContext, useContext, ReactNode, useState } from 'react';

// Define the context shape
interface CurrentDirectoryContextType {
  currentDirectory: string;
  setCurrentDirectory: React.Dispatch<React.SetStateAction<string>>;
}

// Create the context with an undefined initial value
const CurrentDirectoryContext = createContext<CurrentDirectoryContextType | undefined>(undefined);

// Define the provider component
export const CurrentDirectoryProvider = ({ children }: { children: ReactNode }) => {
  const [currentDirectory, setCurrentDirectory] = useState<string>('');

  return (
    <CurrentDirectoryContext.Provider value={{ currentDirectory, setCurrentDirectory }}>
      {children}
    </CurrentDirectoryContext.Provider>
  );
};

// Custom hook for using the current directory context
export const useCurrentDirectory = () => {
  const context = useContext(CurrentDirectoryContext);
  if (context === undefined) {
    throw new Error('useCurrentDirectory must be used within a CurrentDirectoryProvider');
  }
  return context;
};
