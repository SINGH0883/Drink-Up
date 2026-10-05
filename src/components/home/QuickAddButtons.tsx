import React from 'react';
import { GlassWater, Coffee, Plus, Droplets } from 'lucide-react';
import { ML_TO_OZ_RATIO } from '../../lib/constants';
import { UnitType } from '../../types';
import { haptic } from '../../lib/haptics';

interface QuickAddButtonsProps {
  onAdd: (amountMl: number) => void;
  onOpenCustom: () => void;
  unit: UnitType;
}

export const QuickAddButtons: React.FC<QuickAddButtonsProps> = ({ onAdd, onOpenCustom, unit }) => {
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
      badgeColor: 'from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      amount: 250,
      label: 'Glass',
      icon: GlassWater,
      highlight: true,
      tag: 'POPULAR',
      badgeColor: 'from-sky-500/25 to-blue-600/25 text-sky-600 dark:text-sky-300 border-sky-400/40',
      iconColor: 'text-sky-500 dark:text-sky-300',
    },
    {
      amount: 500,
      label: 'Bottle',
      icon: Droplets,
      badgeColor: 'from-teal-500/15 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <div className="w-full px-3.5 my-1">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-full backdrop-blur-md border border-sky-100 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
          <Droplets className="w-3.5 h-3.5 text-sky-500" />
          <span>Quick Log</span>
        </span>
        <button
          onClick={() => {
            haptic.tap();
            onOpenCustom();
          }}
          className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 border border-sky-200/80 dark:border-slate-800 active:scale-95 transition-all shadow-xs backdrop-blur-md"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Custom</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.amount}
              onClick={() => handleAdd(btn.amount)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 active:scale-95 group overflow-hidden ${
                btn.highlight
                  ? 'bg-white dark:bg-slate-900 border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/15'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-sky-300 shadow-sm'
              }`}
            >
              {/* Popular Badge */}
              {btn.tag && (
                <div className="absolute top-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[8px] font-black tracking-widest uppercase shadow-2xs">
                  {btn.tag}
                </div>
              )}

              {/* Glowing Icon Container */}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-110 shadow-2xs ${
                  btn.badgeColor
                } ${btn.highlight ? 'mt-2' : ''}`}
              >
                <Icon className={`w-5 h-5 stroke-[2.2] ${btn.iconColor}`} />
              </div>

              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                +{formatAmount(btn.amount)}
              </span>

              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {btn.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
