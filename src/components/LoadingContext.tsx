'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { LinearProgress, Box } from '@mui/material';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && (
        <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
          <LinearProgress />
        </Box>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 