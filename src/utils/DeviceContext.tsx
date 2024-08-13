
import React, { createContext, useState, ReactNode } from 'react';

interface DeviceContextProps {
  selectedDevice: string | null;
  setSelectedDevice: (deviceCode: string) => void;
}

export const DeviceContext = createContext<DeviceContextProps | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  return (
    <DeviceContext.Provider value={{ selectedDevice, setSelectedDevice }}>
      {children}
    </DeviceContext.Provider>
  );
};