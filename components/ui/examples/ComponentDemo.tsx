'use client';

import React, { useState } from 'react';
import { Button, Card, Input, Modal, ProgressBar } from '../index';

/**
 * Demo component showcasing all base UI components
 * This is for development/documentation purposes only
 */
export const ComponentDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length < 3) {
      setInputError('Must be at least 3 characters');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">UI Components Demo</h1>

      {/* Buttons */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm">Small Primary</Button>
          <Button variant="primary" size="md">Medium Primary</Button>
          <Button variant="primary" size="lg">Large Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-4">
          <Button fullWidth>Full Width Button</Button>
        </div>
      </Card>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm">
          <h3 className="text-white font-medium">Small Padding</h3>
          <p className="text-white/60 text-sm mt-2">This card has small padding</p>
        </Card>
        <Card padding="md">
          <h3 className="text-white font-medium">Medium Padding</h3>
          <p className="text-white/60 text-sm mt-2">This card has medium padding</p>
        </Card>
        <Card padding="lg" hover>
          <h3 className="text-white font-medium">Large Padding + Hover</h3>
          <p className="text-white/60 text-sm mt-2">This card has hover effects</p>
        </Card>
      </div>

      {/* Inputs */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Inputs</h2>
        <div className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter your username"
            helperText="Choose a unique username"
          />
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={inputValue}
            onChange={handleInputChange}
            error={inputError}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
          />
        </div>
      </Card>

      {/* Progress Bars */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Progress Bars</h2>
        <div className="space-y-4">
          <ProgressBar
            value={1500}
            max={2000}
            label="Calories"
            showPercentage
            showValues
          />
          <ProgressBar
            value={45}
            max={50}
            label="Protein (g)"
            showPercentage
            variant="success"
          />
          <ProgressBar
            value={180}
            max={150}
            label="Carbs (g) - Over Target"
            showPercentage
            showValues
          />
          <ProgressBar
            value={30}
            max={100}
            label="Small Progress"
            size="sm"
            showPercentage
          />
        </div>
      </Card>

      {/* Modal */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-white/80">
          This is an example modal dialog. It demonstrates the dark theme styling,
          backdrop blur, and smooth animations.
        </p>
        <div className="mt-4">
          <Input
            label="Example Input"
            placeholder="Type something..."
          />
        </div>
      </Modal>
    </div>
  );
};
