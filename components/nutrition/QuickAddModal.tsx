'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface NutritionItem {
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  sugar: number;
  sodium: number;
}

interface EstimateResponse {
  items: NutritionItem[];
  totals: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    sugar: number;
    sodium: number;
  };
}

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EstimateResponse) => void;
}

export function QuickAddModal({ isOpen, onClose, onSave }: QuickAddModalProps) {
  const [description, setDescription] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState('');
  const [editableItems, setEditableItems] = useState<NutritionItem[]>([]);

  const handleEstimate = async () => {
    if (!description.trim()) {
      setError('Please enter a food description');
      return;
    }

    setIsEstimating(true);
    setError('');

    try {
      const response = await fetch('/api/estimate-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to estimate nutrition');
      }

      const data: EstimateResponse = await response.json();
      setEstimate(data);
      setEditableItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to estimate nutrition');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleItemChange = (index: number, field: keyof NutritionItem, value: string) => {
    const newItems = [...editableItems];
    if (field === 'description') {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = parseFloat(value) || 0;
    }
    setEditableItems(newItems);
  };

  const calculateTotals = () => {
    return editableItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbohydrates: acc.carbohydrates + item.carbohydrates,
        fats: acc.fats + item.fats,
        sugar: acc.sugar + item.sugar,
        sodium: acc.sodium + item.sodium,
      }),
      { calories: 0, protein: 0, carbohydrates: 0, fats: 0, sugar: 0, sodium: 0 }
    );
  };

  const handleSave = () => {
    if (editableItems.length > 0) {
      onSave({
        items: editableItems,
        totals: calculateTotals(),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setDescription('');
    setEstimate(null);
    setEditableItems([]);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Quick Add Nutrition">
      <div className="space-y-4">
        {/* Input section */}
        {!estimate && (
          <>
            <Input
              type="text"
              placeholder="e.g., 4 eggs and 4 pieces of bacon"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={error}
              helperText="Describe what you ate"
              autoFocus
            />
            <Button
              variant="primary"
              onClick={handleEstimate}
              disabled={isEstimating}
              fullWidth
            >
              {isEstimating ? 'Estimating...' : 'Estimate Nutrition'}
            </Button>
          </>
        )}

        {/* Results section */}
        {estimate && (
          <div className="space-y-4">
            <div className="space-y-3">
              {editableItems.map((item, index) => (
                <Card key={index} padding="md">
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="mb-3"
                  />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <label className="text-white/60 text-xs">Calories</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={item.calories.toString()}
                        onChange={(e) => handleItemChange(index, 'calories', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs">Protein (g)</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={item.protein.toString()}
                        onChange={(e) => handleItemChange(index, 'protein', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs">Carbs (g)</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={item.carbohydrates.toString()}
                        onChange={(e) => handleItemChange(index, 'carbohydrates', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs">Fats (g)</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={item.fats.toString()}
                        onChange={(e) => handleItemChange(index, 'fats', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs">Sugar (g)</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={item.sugar.toString()}
                        onChange={(e) => handleItemChange(index, 'sugar', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs">Sodium (mg)</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={item.sodium.toString()}
                        onChange={(e) => handleItemChange(index, 'sodium', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Totals */}
            <Card padding="md" className="bg-accent/10 border-accent/20">
              <h3 className="text-white font-semibold mb-2">Totals</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-white/60 text-xs">Calories</p>
                  <p className="text-white font-semibold">{calculateTotals().calories}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Protein</p>
                  <p className="text-white font-semibold">{calculateTotals().protein}g</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Carbs</p>
                  <p className="text-white font-semibold">{calculateTotals().carbohydrates}g</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Fats</p>
                  <p className="text-white font-semibold">{calculateTotals().fats}g</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Sugar</p>
                  <p className="text-white font-semibold">{calculateTotals().sugar}g</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Sodium</p>
                  <p className="text-white font-semibold">{calculateTotals().sodium}mg</p>
                </div>
              </div>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} fullWidth>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} fullWidth>
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
