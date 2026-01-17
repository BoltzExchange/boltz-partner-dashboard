import { useDenomination, Denomination } from '../contexts/DenominationContext';
import { t } from '../i18n';

export default function DenominationToggle() {
  const { denomination, setDenomination } = useDenomination();
  const strings = t();

  return (
    <div 
      className="flex items-center bg-navy-400 rounded-lg p-0.5"
      title={strings.dashboard.toggleDenomination}
    >
      <button
        onClick={() => setDenomination(Denomination.BTC)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          denomination === Denomination.BTC
            ? 'bg-boltz-primary text-navy-700'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        {strings.common.btc}
      </button>
      <button
        onClick={() => setDenomination(Denomination.SAT)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          denomination === Denomination.SAT
            ? 'bg-boltz-primary text-navy-700'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        {strings.common.sats}
      </button>
    </div>
  );
}
