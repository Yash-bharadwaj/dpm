import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface DeviceContextProps {
  selectedDevice: string | null;
  setSelectedDevice: (deviceCode: string) => void;
}

export const DeviceContext = createContext<DeviceContextProps | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [selectedDevice, setSelectedDevice] = useState<string | null>(() => {
    return localStorage.getItem('selectedDevice') || null;
  });

  
  useEffect(() => {
    if (selectedDevice) {
      localStorage.setItem('selectedDevice', selectedDevice);
    } else {
      localStorage.removeItem('selectedDevice');
    }
  }, [selectedDevice]);

  
  const handleSetSelectedDevice = (deviceCode: string) => {
    setSelectedDevice(deviceCode);
  };

  return (
    <DeviceContext.Provider value={{ selectedDevice, setSelectedDevice: handleSetSelectedDevice }}>
      {children}
    </DeviceContext.Provider>
  );
};
