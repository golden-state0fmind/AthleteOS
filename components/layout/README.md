# Layout Components

This directory contains layout components for AthleteOS that provide consistent navigation and page structure across the application.

## Components

### Navigation

Bottom tab navigation component with icons for all main sections of the app.

**Features:**
- Fixed bottom positioning for easy one-handed mobile use
- Touch-friendly 44x44px minimum tap targets (Requirement 25.3)
- Active state highlighting with electric accent color
- Dark theme with semi-transparent borders (Requirements 26.1, 26.2)
- Accessible labels and ARIA attributes
- Smooth color transitions (under 300ms)

**Usage:**
```tsx
import { Navigation } from '@/components/layout';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Navigation />
    </>
  );
}
```

**Navigation Items:**
- Home (/)
- Workouts (/workouts)
- Nutrition (/nutrition)
- Supplements (/supplements)
- Chat (/chat)
- Settings (/settings)

### Header

Page header component with optional back button and title.

**Features:**
- Sticky top positioning
- Back button using Next.js router navigation
- Touch-friendly 44x44px minimum tap target for back button (Requirement 25.3)
- Dark theme with semi-transparent border (Requirements 26.1, 26.2)
- Custom back handler support
- Optional back button visibility

**Usage:**
```tsx
import { Header } from '@/components/layout';

export default function Page() {
  return (
    <>
      <Header title="Workout Log" />
      {/* Page content */}
    </>
  );
}

// With custom back handler
<Header 
  title="Add Supplement" 
  onBack={() => console.log('Custom back')} 
/>

// Without back button
<Header 
  title="Dashboard" 
  showBackButton={false} 
/>
```

## Design Specifications

### Colors
- Background: `#0a0a0a` (dark)
- Accent: `#10b981` (electric green)
- Text: White with opacity variants
- Borders: White with 10% opacity

### Touch Targets
All interactive elements meet the minimum 44x44px touch target size for accessibility and mobile usability (Requirement 25.3).

### Animations
All transitions use 200ms duration, staying well under the 300ms performance requirement (Requirement 26.4).

## Testing

Tests are located in `__tests__/` and cover:
- Component rendering
- Navigation state management
- Touch target requirements
- Accessibility attributes
- Dark theme styling
- User interactions

Run tests:
```bash
npm test -- --testPathPattern=components/layout
```

## Requirements Validation

**Validates: Requirement 25.4** - Navigation optimized for one-handed mobile use with bottom tab bar
