import React from 'react';
import { GlassWater, Coffee, Sparkles, Plus } from 'lucide-react';
import { ML_TO_OZ_RATIO } from '../../lib/constants';
import { UnitType } from '../../types';

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

  const buttons = [
    {
      amount: 150,
      label: 'Small Cup',
      icon: Coffee,
    },
    {
      amount: 250,
      label: 'Glass',
      icon: GlassWater,
      highlight: true,
    },
    {
      amount: 500,
      label: 'Bottle',
      icon: Sparkles,
    },
  ];

  return (
    <div className="w-full px-4 my-2">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Quick Log
        </span>
        <button
          onClick={onOpenCustom}
          className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Custom</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.amount}
              onClick={() => onAdd(btn.amount)}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-150 active:scale-95 ${
                btn.highlight
                  ? 'bg-surface border-accent text-accent dark:bg-surface dark:border-accent/60 shadow-sm'
                  : 'bg-surface border-surface-border text-foreground hover:border-accent/40 shadow-sm'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                  btn.highlight
                    ? 'bg-accent/10 text-accent dark:bg-accent/20'
                    : 'bg-surface-subtle text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-bold text-foreground">
                +{formatAmount(btn.amount)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground mt-0.5">
                {btn.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
