import { useDenomination, Denomination } from '../contexts/DenominationContext';

export default function DenominationToggle() {
  const { denomination, setDenomination } = useDenomination();

  return (
    <div 
      className="flex items-center bg-navy-400 rounded-lg p-0.5"
      title="Toggle denomination"
    >
      <button
        onClick={() => setDenomination(Denomination.BTC)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          denomination === Denomination.BTC
            ? 'bg-boltz-primary text-navy-700'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        BTC
      </button>
      <button
        onClick={() => setDenomination(Denomination.SAT)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          denomination === Denomination.SAT
            ? 'bg-boltz-primary text-navy-700'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        sats
      </button>
    </div>
  );
}
