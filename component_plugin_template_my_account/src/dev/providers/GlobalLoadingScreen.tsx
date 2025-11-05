import React, { PropsWithChildren } from 'react';
import { useUIStore, LoadingScreen } from '@moderepo/bizstack-console-sdk';

/**
 * This is a simple provider that display the LoadingScreen on top of the app based on the UIStore's `isLoading` state
 */
export const GlobalLoadingScreen: React.FC<PropsWithChildren<unknown>> = () => {
  const isLoading = useUIStore((state) => {
    return state.isLoading;
  });

  return <LoadingScreen open={isLoading} />;
};
