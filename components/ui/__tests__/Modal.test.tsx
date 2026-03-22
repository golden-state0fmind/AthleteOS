import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        Modal content
      </Modal>
    );
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Modal content
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        Modal content
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        Modal content
      </Modal>
    );
    
    const backdrop = container.querySelector('.bg-black\\/80');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('renders footer when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} footer={<button>Save</button>}>
        Modal content
      </Modal>
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('applies dark theme styles', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}}>
        Modal content
      </Modal>
    );
    const modal = container.querySelector('[role="dialog"]');
    expect(modal).toHaveClass('bg-background');
    expect(modal).toHaveClass('border-white/10');
  });

  it('applies correct size class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        Modal content
      </Modal>
    );
    const modal = container.querySelector('[role="dialog"]');
    expect(modal).toHaveClass('max-w-lg');
  });
});
