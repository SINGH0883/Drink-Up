import React from 'react';
import { Undo2, Check } from 'lucide-react';
import { ML_TO_OZ_RATIO } from '../../lib/constants';
import { UnitType } from '../../types';

interface UndoToastProps {
  amountMl: number;
  onUndo: () => void;
  unit: UnitType;
}

export const UndoToast: React.FC<UndoToastProps> = ({ amountMl, onUndo, unit }) => {
  const displayAmount =
    unit === 'oz' ? `${Math.round(amountMl * ML_TO_OZ_RATIO)} fl oz` : `${amountMl} ml`;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto animate-fill-up">
      <div className="flex items-center justify-between px-4 py-3 bg-surface border border-accent/30 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Added <span className="text-accent">{displayAmount}</span>
          </span>
        </div>

        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-bold shadow-sm hover:bg-accent-hover active:scale-95 transition-all"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>
      </div>
    </div>
  );
};
