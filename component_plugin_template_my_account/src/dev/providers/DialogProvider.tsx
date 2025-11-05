import React from 'react';
import { useUIStore } from '@moderepo/bizstack-console-sdk';

/**
 * This is a simple component to wrap the app inside a Dialog provider.
 * All this component does is monitor the UI state's dialog and show the dialog when there is one added to the UI state
 */
export const DialogProvider: React.FC = () => {
  const dialog = useUIStore((state) => {
    return state.dialog;
  });

  return <>{dialog}</>;
};
