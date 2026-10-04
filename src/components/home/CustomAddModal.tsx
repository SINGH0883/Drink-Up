import React, { useState } from 'react';
import { X, Plus, Minus, Droplets } from 'lucide-react';
import { OZ_TO_ML_RATIO } from '../../lib/constants';
import { UnitType } from '../../types';
import { haptic } from '../../lib/haptics';

interface CustomAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (amountMl: number) => void;
  unit: UnitType;
}

export const CustomAddModal: React.FC<CustomAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  unit,
}) => {
  const [value, setValue] = useState<number>(unit === 'oz' ? 8 : 250);

  if (!isOpen) return null;

  const step = unit === 'oz' ? 1 : 50;
  const minVal = unit === 'oz' ? 1 : 50;
  const maxVal = unit === 'oz' ? 68 : 2000;

  const handleIncrement = (amount: number) => {
    haptic.tap();
    setValue((prev) => Math.min(maxVal, Math.max(minVal, prev + amount)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMl = unit === 'oz' ? Math.round(value * OZ_TO_ML_RATIO) : value;
    onAdd(finalMl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fill-up">
      <div className="w-full max-w-sm bg-surface border border-surface-border rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-subtle text-accent flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Log Custom Intake</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center gap-4 py-3">
            <button
              type="button"
              onClick={() => handleIncrement(-step)}
              className="w-12 h-12 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-center text-foreground active:scale-95 transition-transform"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                min={minVal}
                max={maxVal}
                className="w-28 text-center text-3xl font-extrabold bg-transparent text-foreground border-b-2 border-accent focus:outline-none"
              />
              <span className="text-xs font-semibold text-muted-foreground uppercase mt-1">
                {unit === 'oz' ? 'fl oz' : 'ml'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleIncrement(step)}
              className="w-12 h-12 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-center text-foreground active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 justify-center">
            {(unit === 'oz' ? [4, 8, 12, 16] : [100, 200, 300, 500]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  haptic.tap();
                  setValue(preset);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  value === preset
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface-subtle text-muted-foreground border-surface-border'
                }`}
              >
                {preset} {unit === 'oz' ? 'oz' : 'ml'}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-surface-subtle text-muted-foreground font-semibold hover:text-foreground text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-accent text-white font-bold text-sm shadow-md hover:bg-accent-hover active:scale-95 transition-all"
            >
              Add Water
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
