# Implementation Plan: AthleteOS

## Overview

AthleteOS is a Progressive Web App built with Next.js 14+, TypeScript, and Tailwind CSS. The implementation follows a privacy-first, offline-capable architecture with Claude API integration for AI-powered fitness coaching. All user data is stored locally in IndexedDB, and the app is deployed on Vercel's serverless platform.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Next.js 14+ project with TypeScript and App Router
  - Configure Tailwind CSS with custom dark theme (background: #0a0a0a, accent: #10b981)
  - Set up PWA configuration (manifest.json, service worker)
  - Configure Vercel deployment settings and environment variables
  - Install dependencies: @anthropic-ai/sdk, idb (IndexedDB wrapper), zod (validation)
  - Set up security headers in next.config.js (CSP, X-Frame-Options, etc.)
  - _Requirements: 1.1, 1.2, 20.1, 20.2, 20.3, 22.1, 25.5, 26.1_

- [x] 2. IndexedDB schema and data access layer
  - [x] 2.1 Create IndexedDB database initialization with schema version 1
    - Define database name as 'athleteos-db'
    - Create object stores: userProfile, workouts, nutrition, supplements, supplementChecklist, chatHistory
    - Define indexes for each object store per design specification
    - Implement database upgrade handling
    - _Requirements: 4.1, 8.1, 11.4, 14.3, 24.1_
  
  - [x] 2.2 Write property test for IndexedDB persistence
    - **Property 11: IndexedDB Persistence**
    - **Validates: Requirements 4.5, 8.5**
  
  - [x] 2.3 Implement userProfileService with CRUD operations
    - Create getUserProfile, createUserProfile, updateUserProfile functions
    - Implement TypeScript interfaces for UserProfile data model
    - _Requirements: 17.4, 18.3_
  
  - [x] 2.4 Write property test for user profile round trip
    - **Property 35: User Profile Persistence Round Trip**
    - **Validates: Requirements 17.4**
  
  - [x] 2.5 Implement workoutService with data operations
    - Create addWorkout, getWorkouts, getWorkoutsByDateRange, calculateWorkoutStreak functions
    - Implement TypeScript interfaces for WorkoutEntry data model
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.3_
  
  - [x] 2.6 Write property tests for workout data operations
    - **Property 6: Workout Data Persistence Round Trip**
    - **Property 7: Workout Data Integrity**
    - **Property 8: Workout History Sorting**
    - **Property 9: Workout Streak Calculation**
    - **Property 10: Longest Workout Streak Calculation**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 28.2, 28.3**
  
  - [x] 2.7 Implement nutritionService with data operations
    - Create addNutritionEntry, getNutritionByDate, getDailyTotals, updateEntryStatus functions
    - Implement TypeScript interfaces for NutritionEntry and MacroData
    - Implement checkGoalConflicts function for warning generation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 10.2, 10.3, 10.4_
  
  - [x] 2.8 Write property tests for nutrition data operations
    - **Property 16: Nutrition Data Persistence Round Trip**
    - **Property 17: Nutrition Data Integrity**
    - **Property 18: Nutrition Grouping by Date**
    - **Property 19: Daily Macro Totals Calculation**
    - **Property 20: Nutrition Entry Status Update**
    - **Property 21: Default Nutrition Status**
    - **Property 22: Planned and Consumed in Daily Totals**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.4**
  
  - [x] 2.9 Implement supplementService with data operations
    - Create addSupplement, getActiveSupplements, deactivateSupplement, getTodayChecklist, markSupplementTaken functions
    - Implement TypeScript interfaces for SupplementEntry and SupplementChecklistEntry
    - _Requirements: 11.4, 14.1, 14.2, 14.3_
  
  - [x] 2.10 Write property tests for supplement data operations
    - **Property 26: Supplement Data Persistence Round Trip**
    - **Property 30: Daily Supplement Checklist Filtering**
    - **Property 31: Supplement Taken Status Update**
    - **Property 32: Checklist Completion Percentage**
    - **Validates: Requirements 11.4, 14.1, 14.2, 14.3, 14.5**
  
  - [x] 2.11 Implement chatService with message operations
    - Create addChatMessage, getChatHistory, clearChatHistory functions
    - Implement TypeScript interfaces for ChatMessage
    - _Requirements: 15.6_
  
  - [x] 2.12 Implement exportService for data export/import
    - Create exportUserData function to generate JSON export
    - Create importUserData function to restore from JSON
    - Implement ExportData TypeScript interface
    - _Requirements: 24.4, 30.2, 30.4_
  
  - [x] 2.13 Write property tests for data export/import
    - **Property 48: Data Export Completeness**
    - **Property 59: Export File Metadata**
    - **Property 60: Import-Export Round Trip**
    - **Validates: Requirements 24.4, 30.2, 30.4, 30.5**

- [x] 3. Checkpoint - Verify data layer functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Claude API integration and utility functions
  - [x] 4.1 Create Claude API client configuration
    - Set up Anthropic SDK client with API key from environment variables
    - Define CLAUDE_MODEL constant as 'claude-sonnet-4-20250514'
    - Implement validateEnvironment function to check for ANTHROPIC_API_KEY
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 4.2 Write unit test for API key validation
    - Test that validateEnvironment throws error when API key is missing
    - Test that API key is never exposed in responses
    - **Validates: Property 1: API Key Never Exposed**
    - _Requirements: 1.3_
  
  - [x] 4.3 Implement image validation utilities
    - Create validateImageUpload function to check format and size
    - Support JPEG, PNG, WebP formats up to 10MB
    - Implement imageToBase64 conversion utility
    - _Requirements: 2.2, 2.4, 6.2, 6.4_
  
  - [x] 4.4 Write property test for image format validation
    - **Property 2: Image Format Validation**
    - **Validates: Requirements 2.2, 6.2**
  
  - [x] 4.5 Implement vision analysis utility
    - Create analyzeImageWithClaude function for shared vision analysis logic
    - Handle base64 image encoding and Claude API message construction
    - _Requirements: 3.1, 7.1_
  
  - [x] 4.6 Implement supplement analysis utility
    - Create analyzeSupplementWithClaude function for text-based analysis
    - Support interaction detection when multiple supplements provided
    - _Requirements: 12.1, 12.2, 13.1, 13.2_
  
  - [x] 4.7 Implement chat context builder
    - Create buildSystemPrompt function to construct context from user data
    - Include user profile, recent workouts (7 days), today's nutrition, active supplements
    - _Requirements: 15.3, 16.1, 16.2, 16.3, 16.4_
  
  - [x] 4.8 Write property test for chat context construction
    - **Property 33: Chat Context Construction**
    - **Validates: Requirements 15.3, 16.1, 16.2, 16.3**
  
  - [x] 4.9 Implement Claude API error handling
    - Create ClaudeAPIError class with status codes
    - Implement handleClaudeAPICall wrapper with retry logic
    - Handle rate limits (429), server errors (500), unavailability (503)
    - _Requirements: 27.1, 27.2, 27.3, 27.4_
  
  - [x] 4.10 Write unit tests for API error handling
    - Test error responses for different status codes
    - Test retry logic for server errors
    - **Validates: Property 5: API Error Handling**
    - _Requirements: 27.2, 27.3, 27.4_
  
  - [x] 4.11 Implement request validation schemas with Zod
    - Create WorkoutImageSchema, NutritionImageSchema, SupplementRequestSchema, ChatRequestSchema
    - _Requirements: 27.1_

- [x] 5. Serverless API routes
  - [x] 5.1 Implement POST /api/analyze-workout
    - Validate request with WorkoutImageSchema
    - Call analyzeImageWithClaude with workout-specific prompt
    - Parse and return structured response with exerciseType, estimatedReps, formFeedback, confidence
    - Implement error handling with appropriate status codes
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 5.2 Write property test for workout analysis response structure
    - **Property 4: Workout Analysis Response Structure**
    - **Validates: Requirements 3.3**
  
  - [x] 5.3 Write unit tests for /api/analyze-workout
    - Test successful analysis with valid image
    - Test error handling for invalid format
    - Test error handling for oversized image
    - _Requirements: 2.5, 3.5_
  
  - [x] 5.4 Implement POST /api/analyze-nutrition
    - Validate request with NutritionImageSchema
    - Call analyzeImageWithClaude with nutrition-specific prompt
    - Parse and return structured response with foodName, servingSize, macros, confidence
    - Handle partial data with null values for missing fields
    - _Requirements: 6.3, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 5.5 Write property tests for nutrition analysis
    - **Property 14: Nutrition Analysis Response Structure**
    - **Property 15: Partial Nutrition Data Handling**
    - **Validates: Requirements 7.3, 7.5**
  
  - [x] 5.6 Implement POST /api/analyze-supplement
    - Validate request with SupplementRequestSchema
    - Call analyzeSupplementWithClaude with supplement data
    - Return structured response with safetyNotes, effectiveness, interactions
    - _Requirements: 11.3, 12.1, 12.2, 12.3, 12.4, 13.1, 13.2_
  
  - [x] 5.7 Write property test for supplement analysis response structure
    - **Property 27: Supplement Analysis Response Structure**
    - **Validates: Requirements 12.3**
  
  - [x] 5.8 Implement POST /api/chat
    - Validate request with ChatRequestSchema
    - Build system prompt with chat context
    - Call Claude API with conversational model
    - Return response text
    - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.7_
  
  - [x] 5.9 Write unit tests for /api/chat
    - Test chat with complete context
    - Test error handling for missing context
    - _Requirements: 15.2, 15.3_

- [x] 6. Checkpoint - Verify API routes functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Core UI components library
  - [x] 7.1 Create base UI components
    - Implement Button component with touch-friendly sizing (44x44px minimum)
    - Implement Card component with dark theme styling
    - Implement Input component with validation states
    - Implement Modal component for dialogs
    - Implement ProgressBar component for macro visualization
    - _Requirements: 25.3, 26.1, 26.2, 26.3_
  
  - [x] 7.2 Write property test for touch target sizing
    - **Property 50: Touch Target Sizing**
    - **Validates: Requirements 25.3**
  
  - [x] 7.3 Create layout components
    - Implement Navigation component with bottom tab navigation
    - Implement Header component with back button
    - _Requirements: 25.4_
  
  - [x] 7.4 Create dashboard components
    - Implement DailyMetrics component for calorie/workout/supplement counts
    - Implement QuickChat component for quick-access chat input
    - Implement StreakDisplay component for workout streak visualization
    - _Requirements: 19.2, 19.3, 19.4, 19.5_
  
  - [x] 7.5 Write property tests for dashboard metrics
    - **Property 39: Dashboard Workout Count**
    - **Property 40: Dashboard Supplement Count**
    - **Validates: Requirements 19.3, 19.4**
  
  - [x] 7.6 Create workout components
    - Implement WorkoutCard component for individual workout display
    - Implement WorkoutList component for scrollable history
    - Implement ImageUploader component with preview
    - Implement ProgressStats component for streak and frequency
    - _Requirements: 4.3, 28.1, 28.2, 28.3, 28.4, 28.5_
  
  - [x] 7.7 Write property tests for workout progress calculations
    - **Property 52: 30-Day Workout History Filtering**
    - **Property 53: Weekly Workout Frequency**
    - **Property 54: Most Frequent Exercise Identification**
    - **Validates: Requirements 28.1, 28.4, 28.5**
  
  - [x] 7.8 Create nutrition components
    - Implement NutritionCard component for individual entry display
    - Implement DailyTotals component for aggregated macros
    - Implement MacroProgress component with progress bars
    - Implement GoalWarning component for conflict warnings
    - _Requirements: 8.3, 8.4, 10.2, 10.3, 10.4, 29.3, 29.4_
  
  - [x] 7.9 Write property tests for nutrition warnings and progress
    - **Property 23: High Calorie Warning for Weight Loss**
    - **Property 24: Low Protein Message for Muscle Building**
    - **Property 25: High Sodium Warning**
    - **Property 56: Macro Progress Percentage**
    - **Property 58: Macro Overage Warning**
    - **Validates: Requirements 10.2, 10.3, 10.4, 29.3, 29.5**
  
  - [x] 7.10 Create supplement components
    - Implement SupplementCard component with safety notes display
    - Implement DailyChecklist component for today's supplements
    - Implement InteractionWarning component for interaction alerts
    - _Requirements: 12.5, 14.1, 14.2, 14.5, 13.3_
  
  - [x] 7.11 Write property test for supplement safety notes display
    - **Property 28: Safety Notes Display**
    - **Property 29: Interaction Warning Display**
    - **Validates: Requirements 12.5, 13.3**
  
  - [x] 7.12 Create chat components
    - Implement MessageList component for conversation history
    - Implement MessageBubble component for individual messages
    - Implement ChatInput component with send button
    - _Requirements: 15.1, 15.6_
  
  - [x] 7.13 Write property test for chat history display
    - **Property 34: Chat History Display**
    - **Validates: Requirements 15.6**

- [x] 8. Application pages and routing
  - [x] 8.1 Create root layout (app/layout.tsx)
    - Set up HTML structure with PWA meta tags
    - Register service worker in useEffect
    - Include OfflineBanner component
    - Apply Tailwind CSS global styles
    - _Requirements: 20.4, 21.5, 25.5, 26.1_
  
  - [x] 8.2 Create dashboard home page (app/page.tsx)
    - Display DailyMetrics component with today's stats
    - Display QuickChat component for AI coach access
    - Display StreakDisplay component for workout streaks
    - Implement metric refresh on data changes
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
  
  - [x] 8.3 Write property test for dashboard metric reactivity
    - **Property 41: Dashboard Metric Reactivity**
    - **Validates: Requirements 19.6**
  
  - [x] 8.4 Create onboarding page (app/onboarding/page.tsx)
    - Implement multi-step form for name, age, weight, height, fitness goal
    - Validate fitness goal selection (lose weight, build muscle, maintain, performance)
    - Save user profile to IndexedDB on completion
    - Redirect to dashboard after profile creation
    - _Requirements: 17.1, 17.2, 17.3, 17.4_
  
  - [x] 8.5 Write property test for onboarding skip logic
    - **Property 36: Onboarding Skip After Profile Creation**
    - **Validates: Requirements 17.5**
  
  - [x] 8.6 Create workout pages
    - Implement app/workouts/page.tsx for workout log list view
    - Implement app/workouts/upload/page.tsx for image upload
    - Implement app/workouts/manual/page.tsx for manual entry form
    - _Requirements: 2.1, 4.3, 5.1, 5.2, 5.4_
  
  - [x] 8.7 Write property tests for workout functionality
    - **Property 12: Manual Workout Entry Persistence**
    - **Property 13: Mixed Source Workout Display**
    - **Validates: Requirements 5.3, 5.4**
  
  - [x] 8.8 Create nutrition pages
    - Implement app/nutrition/page.tsx for nutrition log grouped by date
    - Implement app/nutrition/upload/page.tsx for label upload
    - Include status toggle for planned/consumed entries
    - Display daily totals and macro progress
    - _Requirements: 6.1, 8.3, 8.4, 9.1, 9.3_
  
  - [x] 8.9 Write property test for macro target display
    - **Property 55: Macro Target Display Conditional**
    - **Property 57: Macro Progress Indicator Display**
    - **Validates: Requirements 29.1, 29.4**
  
  - [x] 8.10 Create supplement pages
    - Implement app/supplements/page.tsx for supplement log and checklist
    - Implement app/supplements/add/page.tsx for add supplement form
    - Display daily checklist with completion percentage
    - _Requirements: 11.1, 11.2, 14.1, 14.4, 14.5_
  
  - [x] 8.11 Create chat page (app/chat/page.tsx)
    - Display MessageList component with conversation history
    - Implement ChatInput component with context gathering
    - Make chat accessible from all screens via navigation
    - _Requirements: 15.1, 15.2, 15.6_
  
  - [x] 8.12 Create settings page (app/settings/page.tsx)
    - Implement profile editing form for all User_Profile fields
    - Implement macro target setting form
    - Implement data export button with download trigger
    - Implement data import file upload
    - _Requirements: 18.1, 18.2, 18.3, 29.2, 30.1, 30.3, 30.5_
  
  - [x] 8.13 Write property test for profile update persistence
    - **Property 37: Profile Update Persistence**
    - **Property 38: Updated Profile in Context**
    - **Validates: Requirements 18.3, 18.4**

- [x] 9. Checkpoint - Verify UI and routing functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. PWA configuration and offline functionality
  - [x] 10.1 Create Web Manifest (public/manifest.json)
    - Define app name as "AthleteOS"
    - Set display mode to "standalone"
    - Configure background color (#0a0a0a) and theme color (#10b981)
    - Set orientation to "portrait"
    - Include icon definitions for all required sizes (72x72 to 512x512)
    - _Requirements: 20.1, 20.2, 20.3_
  
  - [x] 10.2 Generate PWA icons
    - Create icon files in public/icons/ for all sizes: 72, 96, 128, 144, 152, 192, 384, 512
    - Ensure icons are maskable and follow PWA guidelines
    - _Requirements: 20.1_
  
  - [x] 10.3 Implement Service Worker (public/sw.js)
    - Implement install event to cache app shell
    - Implement activate event to clean old caches
    - Implement fetch event with route-based caching strategy
    - Cache static assets (Cache First strategy)
    - Network-only for API routes with offline fallback
    - _Requirements: 20.4, 21.1, 21.2, 21.4, 22.3_
  
  - [x] 10.4 Create offline detection hook (hooks/useOnlineStatus.ts)
    - Listen to online/offline events
    - Return current online status
    - _Requirements: 21.4, 21.5_
  
  - [x] 10.5 Implement offline UI components
    - Create OfflineGate component to disable AI features when offline
    - Create OfflineBanner component to show offline status
    - _Requirements: 21.4, 21.5_
  
  - [x] 10.6 Write property tests for offline functionality
    - **Property 42: Offline Data Access**
    - **Property 43: Offline Manual Entry**
    - **Property 44: Offline Feature Gating**
    - **Validates: Requirements 21.2, 21.3, 21.4**

- [x] 11. Security and privacy implementation
  - [x] 11.1 Configure security headers in next.config.js
    - Implement Content-Security-Policy header
    - Add X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers
    - Configure Permissions-Policy
    - _Requirements: 22.1, 22.2_
  
  - [x] 11.2 Implement image processing security
    - Ensure images processed in memory only (no disk writes)
    - Verify image data discarded after analysis
    - Implement memory cleanup in API routes
    - _Requirements: 23.1, 23.2, 23.3, 23.4_
  
  - [x] 11.3 Write property tests for image privacy
    - **Property 45: No Image Persistence**
    - **Property 46: Text-Only Analysis Storage**
    - **Validates: Requirements 23.4, 23.5**
  
  - [x] 11.4 Implement data privacy measures
    - Verify health data only transmitted in /api/chat context
    - Ensure no server-side persistence of user data
    - Implement client-side only storage in IndexedDB
    - _Requirements: 24.1, 24.2, 24.3_
  
  - [x] 11.5 Write property test for health data transmission restriction
    - **Property 47: Health Data Transmission Restriction**
    - **Validates: Requirements 24.2**

- [x] 12. Error handling and user feedback
  - [x] 12.1 Implement client-side error handling utilities
    - Create handleAPIError function for API error responses
    - Create showError toast/notification system
    - Implement error logging utility
    - _Requirements: 27.5_
  
  - [x] 12.2 Write property test for error message display
    - **Property 3: Error Message Display**
    - **Validates: Requirements 2.5, 27.5**
  
  - [x] 12.3 Implement API route error wrapper
    - Create withErrorHandling higher-order function
    - Handle Zod validation errors
    - Handle ClaudeAPIError with appropriate status codes
    - _Requirements: 27.1, 27.2, 27.3_
  
  - [x] 12.4 Add error boundaries to React components
    - Implement error boundary for each major page
    - Display user-friendly error messages
    - _Requirements: 27.5_

- [x] 13. Responsive design and animations
  - [x] 13.1 Implement responsive breakpoints with Tailwind
    - Test layouts at 320px, 768px, 1024px, 1920px widths
    - Ensure all functionality accessible at all breakpoints
    - _Requirements: 25.1, 25.2_
  
  - [x] 13.2 Write property test for responsive functionality
    - **Property 49: Responsive Functionality**
    - **Validates: Requirements 25.2**
  
  - [x] 13.3 Implement animations with duration limits
    - Add transition classes with max 300ms duration
    - Apply to state changes, modals, navigation
    - _Requirements: 26.4_
  
  - [x] 13.4 Write property test for animation duration
    - **Property 51: Animation Duration Limit**
    - **Validates: Requirements 26.4**

- [x] 14. Final integration and wiring
  - [x] 14.1 Wire all components together
    - Connect API routes to UI components
    - Connect IndexedDB services to UI components
    - Ensure data flows correctly through the application
    - _Requirements: All_
  
  - [x] 14.2 Implement environment variable configuration
    - Set up .env.local template with ANTHROPIC_API_KEY placeholder
    - Document Vercel environment variable setup
    - _Requirements: 1.1, 1.2_
  
  - [x] 14.3 Create README with setup instructions
    - Document installation steps
    - Document environment variable configuration
    - Document deployment to Vercel
    - Include PWA installation instructions
  
  - [x] 14.4 Verify HTTPS enforcement on Vercel
    - Test that HTTP redirects to HTTPS
    - Verify service worker only registers on HTTPS
    - _Requirements: 22.1, 22.2, 22.3_

- [x] 15. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples, edge cases, and error conditions
- All property tests should use fast-check library with minimum 100 iterations
- Service Worker requires HTTPS to function (enforced by browser)
- Claude API key must be configured in Vercel environment variables before deployment
- IndexedDB data is origin-scoped and persists across browser sessions
- All images are processed in memory and never persisted to storage
