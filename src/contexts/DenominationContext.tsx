import { createContext, useContext, useState, ReactNode } from 'react';

export enum Denomination {
  BTC = 'btc',
  SAT = 'sat',
}

interface DenominationContextType {
  denomination: Denomination;
  setDenomination: (d: Denomination) => void;
  toggleDenomination: () => void;
  formatValue: (btcValue: number) => string;
  formatSats: (sats: number) => string;
}

const DenominationContext = createContext<DenominationContextType | undefined>(undefined);

export function DenominationProvider({ children }: { children: ReactNode }) {
  const [denomination, setDenomination] = useState<Denomination>(() => {
    const saved = localStorage.getItem('denomination');
    return saved === Denomination.BTC ? Denomination.BTC : Denomination.SAT;
  });

  const toggleDenomination = () => {
    const newDenom = denomination === Denomination.BTC ? Denomination.SAT : Denomination.BTC;
    setDenomination(newDenom);
    localStorage.setItem('denomination', newDenom);
  };

  const handleSetDenomination = (d: Denomination) => {
    setDenomination(d);
    localStorage.setItem('denomination', d);
  };

  const formatValue = (btcValue: number): string => {
    if (denomination === Denomination.BTC) {
      return `${btcValue.toFixed(8)} BTC`;
    }
    const sats = Math.round(btcValue * 100_000_000);
    return `${sats.toLocaleString()} sats`;
  };

  const formatSats = (sats: number): string => {
    if (denomination === Denomination.SAT) {
      return `${sats.toLocaleString()} sats`;
    }
    const btc = sats / 100_000_000;
    return `${btc.toFixed(8)} BTC`;
  };

  return (
    <DenominationContext.Provider
      value={{
        denomination,
        setDenomination: handleSetDenomination,
        toggleDenomination,
        formatValue,
        formatSats,
      }}
    >
      {children}
    </DenominationContext.Provider>
  );
}

export function useDenomination() {
  const context = useContext(DenominationContext);
  if (context === undefined) {
    throw new Error('useDenomination must be used within a DenominationProvider');
  }
  return context;
}
