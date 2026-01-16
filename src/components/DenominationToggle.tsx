import { useDenomination, Denomination } from '../contexts/DenominationContext';

export default function DenominationToggle() {
  const { denomination, setDenomination } = useDenomination();

  return (
    <div 
      className="flex items-center bg-night-800 rounded-lg p-0.5"
      title="Toggle denomination"
    >
      <button
        onClick={() => setDenomination(Denomination.BTC)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          denomination === Denomination.BTC
            ? 'bg-volt-500 text-night-950'
            : 'text-night-400 hover:text-night-200'
        }`}
      >
        BTC
      </button>
      <button
        onClick={() => setDenomination(Denomination.SAT)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          denomination === Denomination.SAT
            ? 'bg-volt-500 text-night-950'
            : 'text-night-400 hover:text-night-200'
        }`}
      >
        sats
      </button>
    </div>
  );
}
