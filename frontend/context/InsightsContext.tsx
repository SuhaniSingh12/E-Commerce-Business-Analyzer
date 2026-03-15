'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface InsightsContextType {
  insights: any | null;
  isLoading: boolean;
  error: string | null;
  fetchInsights: () => Promise<void>;
  clearInsights: () => void;
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

export function InsightsProvider({ children }: { children: ReactNode }) {
  const [insights, setInsights] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/analyze');
      if (response.data.success) {
        setInsights(response.data.insights);
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze data');
    } finally {
      setIsLoading(false);
    }
  };

  const clearInsights = () => {
    setInsights(null);
    setError(null);
  };

  return (
    <InsightsContext.Provider value={{ insights, isLoading, error, fetchInsights, clearInsights }}>
      {children}
    </InsightsContext.Provider>
  );
}

export function useInsights() {
  const context = useContext(InsightsContext);
  if (context === undefined) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
}

