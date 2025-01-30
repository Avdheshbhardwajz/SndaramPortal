import { useState, useCallback } from 'react';

export type AlertType = 'error' | 'success' | 'info';

export interface AlertState {
  show: boolean;
  message: string;
  type: AlertType;
}

export function useAlert(duration = 3000) {
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((message: string, type: AlertType) => {
    setAlert({ show: true, message, type });
    const timer = setTimeout(
      () => setAlert({ show: false, message: '', type: 'info' }),
      duration
    );
    return () => clearTimeout(timer);
  }, [duration]);

  return { alert, showAlert };
}
