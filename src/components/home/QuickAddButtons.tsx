import { GlassWater, Coffee, Droplets } from 'lucide-react';
import { ML_TO_OZ_RATIO } from '../../lib/constants';
import { UnitType } from '../../types';
import { haptic } from '../../lib/haptics';

interface QuickAddButtonsProps {
  onAdd: (amountMl: number) => void;
  unit: UnitType;
}

export const QuickAddButtons: React.FC<QuickAddButtonsProps> = ({ onAdd, unit }) => {
  const formatAmount = (ml: number) => {
    if (unit === 'oz') {
      return `${Math.round(ml * ML_TO_OZ_RATIO)} oz`;
    }
    return `${ml} ml`;
  };

  const handleAdd = (amount: number) => {
    haptic.success();
    onAdd(amount);
  };

  const buttons = [
    {
      amount: 150,
      label: 'Small Cup',
      icon: Coffee,
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700/60 shadow-xs',
      iconColor: 'text-amber-700 dark:text-amber-300',
    },
    {
      amount: 250,
      label: 'Glass',
      icon: GlassWater,
      highlight: true,
      tag: 'POPULAR',
      badgeColor: 'bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-700/60 shadow-xs',
      iconColor: 'text-sky-700 dark:text-sky-300',
    },
    {
      amount: 500,
      label: 'Bottle',
      icon: Droplets,
      badgeColor: 'bg-teal-100 dark:bg-teal-950/80 border-teal-300 dark:border-teal-700/60 shadow-xs',
      iconColor: 'text-teal-700 dark:text-teal-300',
    },
  ];

  return (
    <div className="w-full px-3.5 my-1">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="glass-pill text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
          <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 fill-sky-500/20" />
          <span>Quick Log</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.amount}
              onClick={() => handleAdd(btn.amount)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 active:scale-95 group overflow-hidden ${
                btn.highlight
                  ? 'glass-card-highlight ring-2 ring-sky-500/50 shadow-xl shadow-sky-500/20'
                  : 'glass-card hover:border-sky-400/80 shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {btn.tag && (
                <div className="absolute top-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 text-white text-[8px] font-black tracking-widest uppercase shadow-md">
                  {btn.tag}
                </div>
              )}

              {/* Glowing Icon Container */}
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-110 ${
                  btn.badgeColor
                } ${btn.highlight ? 'mt-2' : ''}`}
              >
                <Icon className={`w-5 h-5 stroke-[2.4] ${btn.iconColor}`} />
              </div>

              <span className="text-[17px] font-black text-slate-950 dark:text-white tracking-tight">
                +{formatAmount(btn.amount)}
              </span>

              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-0.5">
                {btn.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
