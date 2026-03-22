'use client';

import React from 'react';
import { Navigation, Header } from '../index';

/**
 * LayoutDemo - Example usage of layout components
 * 
 * This component demonstrates how to use the Navigation and Header
 * components together to create a consistent page layout.
 */
export const LayoutDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header at the top */}
      <Header title="Example Page" />
      
      {/* Main content area with bottom padding to account for fixed navigation */}
      <main className="pb-24 px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Layout Components Demo</h2>
        
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-accent">Navigation</h3>
          <p className="text-white/80 mb-2">
            The bottom navigation bar provides quick access to all main sections:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1">
            <li>Home - Dashboard with daily metrics</li>
            <li>Workouts - Exercise tracking and history</li>
            <li>Nutrition - Food logging and macro tracking</li>
            <li>Supplements - Supplement log and daily checklist</li>
            <li>Chat - AI coach conversation</li>
            <li>Settings - Profile and app settings</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-accent">Header</h3>
          <p className="text-white/80 mb-2">
            The header component provides:
          </p>
          <ul className="list-disc list-inside text-white/70 space-y-1">
            <li>Page title for context</li>
            <li>Back button for navigation (uses Next.js router)</li>
            <li>Sticky positioning for always-visible navigation</li>
            <li>Optional custom back handler</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-accent">Usage Example</h3>
          <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto text-sm">
{`import { Navigation, Header } from '@/components/layout';

export default function MyPage() {
  return (
    <>
      <Header title="My Page" />
      <main className="pb-24 px-4">
        {/* Your content here */}
      </main>
      <Navigation />
    </>
  );
}`}
          </pre>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2 text-accent">Design Features</h3>
          <ul className="list-disc list-inside text-white/70 space-y-1">
            <li>Dark theme (#0a0a0a background)</li>
            <li>Electric green accent (#10b981)</li>
            <li>44x44px minimum touch targets</li>
            <li>Smooth transitions under 300ms</li>
            <li>Mobile-first responsive design</li>
            <li>Accessible with ARIA labels</li>
          </ul>
        </section>
      </main>
      
      {/* Fixed bottom navigation */}
      <Navigation />
    </div>
  );
};
