import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders progress bar with correct percentage', () => {
    render(<ProgressBar value={50} max={100} label="Progress" />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays label when provided', () => {
    render(<ProgressBar value={50} max={100} label="Calories" />);
    expect(screen.getByText('Calories')).toBeInTheDocument();
  });

  it('displays percentage when showPercentage is true', () => {
    render(<ProgressBar value={75} max={100} showPercentage />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays values when showValues is true', () => {
    render(<ProgressBar value={50} max={100} showValues />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('applies accent color for default variant', () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    const progressFill = container.querySelector('[role="progressbar"]');
    expect(progressFill).toHaveClass('bg-accent');
  });

  it('applies success color for success variant', () => {
    const { container } = render(<ProgressBar value={50} max={100} variant="success" />);
    const progressFill = container.querySelector('[role="progressbar"]');
    expect(progressFill).toHaveClass('bg-green-500');
  });

  it('caps percentage at 100%', () => {
    render(<ProgressBar value={150} max={100} showPercentage />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows red color when over target', () => {
    const { container } = render(<ProgressBar value={120} max={100} />);
    const progressFill = container.querySelector('[role="progressbar"]');
    expect(progressFill).toHaveClass('bg-red-500');
  });
});
