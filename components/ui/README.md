# UI Components

Base UI components for AthleteOS with dark theme and touch-friendly design.

## Components

### Button

Touch-friendly button component with 44x44px minimum sizing (Requirement 25.3).

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `fullWidth`: boolean (default: false)
- All standard button HTML attributes

**Features:**
- Minimum 44x44px touch target size (Requirement 25.3)
- Dark theme with electric accent colors (Requirements 26.1, 26.2)
- Smooth transitions under 300ms (Requirement 26.4)

### Card

Dark theme card component for content grouping.

```tsx
import { Card } from '@/components/ui';

<Card padding="md" hover>
  Card content
</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `hover`: boolean - enables hover effects (default: false)
- All standard div HTML attributes

**Features:**
- Dark background with subtle borders (Requirements 26.1, 26.2)
- Optional hover effects with smooth transitions (Requirement 26.4)

### Input

Input component with validation states and dark theme.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email"
  helperText="We'll never share your email"
/>
```

**Props:**
- `label`: string - optional label text
- `error`: string - error message to display
- `helperText`: string - helper text below input
- All standard input HTML attributes

**Features:**
- Minimum 44px height for touch targets (Requirement 25.3)
- Dark theme with accent focus states (Requirements 26.1, 26.2)
- Validation error states with red highlighting

### Modal

Modal dialog component with backdrop and keyboard support.

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  Modal content goes here
</Modal>
```

**Props:**
- `isOpen`: boolean - controls modal visibility
- `onClose`: () => void - callback when modal should close
- `title`: string - optional modal title
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `footer`: ReactNode - optional footer content
- `children`: ReactNode - modal body content

**Features:**
- Dark theme with backdrop blur (Requirements 26.1, 26.2)
- Keyboard support (Escape to close)
- Body scroll lock when open
- Smooth animations under 300ms (Requirement 26.4)

### ProgressBar

Progress bar for macro visualization and goal tracking.

```tsx
import { ProgressBar } from '@/components/ui';

<ProgressBar
  value={1800}
  max={2000}
  label="Calories"
  showPercentage
  showValues
  variant="default"
  size="md"
/>
```

**Props:**
- `value`: number - current value
- `max`: number - maximum value
- `label`: string - optional label text
- `showPercentage`: boolean - display percentage (default: false)
- `showValues`: boolean - display value/max (default: false)
- `variant`: 'default' | 'success' | 'warning' | 'danger' (default: 'default')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')

**Features:**
- Electric accent colors (Requirement 26.2)
- Auto-adjusts color when over target (red) or near target (yellow)
- Smooth progress animations (Requirement 26.4)
- Dark theme background (Requirement 26.1)

## Design System

All components follow the AthleteOS design system:

- **Dark Theme**: Background color #0a0a0a (Requirement 26.1)
- **Accent Color**: Electric green #10b981 (Requirement 26.2)
- **Touch Targets**: Minimum 44x44px (Requirement 25.3)
- **Animations**: Under 300ms duration (Requirement 26.4)
- **Typography**: Clean, modern, optimized for readability (Requirement 26.3)

## Testing

All components have comprehensive unit tests. Run tests with:

```bash
npm test components/ui/__tests__
```

## Usage

Import components from the index file:

```tsx
import { Button, Card, Input, Modal, ProgressBar } from '@/components/ui';
```

Or import individually:

```tsx
import { Button } from '@/components/ui/Button';
```
