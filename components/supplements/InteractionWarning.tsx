import React from 'react';
import { Modal } from '../ui/Modal';

export interface Interaction {
  supplement1: string;
  supplement2: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface InteractionWarningProps {
  interactions: Interaction[];
  isOpen: boolean;
  onClose: () => void;
}

export const InteractionWarning: React.FC<InteractionWarningProps> = ({
  interactions,
  isOpen,
  onClose,
}) => {
  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'low':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
    }
  };

  if (interactions.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Supplement Interactions">
      <div className="space-y-4">
        <p className="text-sm text-white/80">
          The following potential interactions have been detected between your supplements:
        </p>

        <div className="space-y-3">
          {interactions.map((interaction, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getSeverityColor(interaction.severity)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {getSeverityIcon(interaction.severity)}
                </span>
                <div className="flex-1">
                  <p className="font-semibold mb-1">
                    {interaction.supplement1} + {interaction.supplement2}
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Severity:</span>{' '}
                    <span className="capitalize">{interaction.severity}</span>
                  </p>
                  <p className="text-sm">{interaction.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-white/60">
            <strong>Disclaimer:</strong> This information is not medical advice. 
            Please consult with a healthcare professional before making any changes 
            to your supplement regimen.
          </p>
        </div>
      </div>
    </Modal>
  );
};
