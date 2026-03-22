# AthleteOS

AI-Powered Personal Fitness Assistant - A Progressive Web App built with Next.js, TypeScript, and Claude AI.

## Features

- 🏋️ Workout tracking with AI image analysis
- 🥗 Nutrition logging with label scanning
- 💊 Supplement management with safety analysis
- 💬 AI fitness coach powered by Claude
- 📱 Progressive Web App (installable on mobile)
- 🔒 Privacy-first: all data stored locally
- 📴 Offline-capable for viewing logs and manual entry

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API (claude-sonnet-4)
- **Storage**: IndexedDB (client-side only)
- **Deployment**: Vercel (serverless)
- **PWA**: Service Worker + Web Manifest

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd athleteos
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `ANTHROPIC_API_KEY` with your API key
   - Redeploy the project

## PWA Installation

### On Mobile (iOS/Android)

1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the share button
3. Select "Add to Home Screen"
4. The app will install and appear on your home screen

### On Desktop

1. Open the app in Chrome, Edge, or Safari
2. Look for the install icon in the address bar
3. Click "Install" to add the app to your system

## Project Structure

```
athleteos/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with PWA setup
│   ├── page.tsx           # Dashboard home page
│   └── offline/           # Offline fallback page
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js             # Service worker
│   └── icons/            # PWA icons (various sizes)
├── next.config.ts        # Next.js config with security headers
├── tailwind.config.ts    # Tailwind CSS config (dark theme)
└── .env.local.example    # Environment variables template
```

## Security

- **API Key**: Stored securely in environment variables, never exposed to client
- **HTTPS**: Enforced by Vercel, required for PWA functionality
- **CSP**: Content Security Policy headers configured
- **Privacy**: All user data stored locally in IndexedDB
- **No Image Storage**: Uploaded images processed in memory only

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Testing

Tests will be added in subsequent tasks using:
- Jest for unit tests
- fast-check for property-based tests

## Requirements

This project implements the following key requirements:
- Secure API key management (Req 1.1-1.4)
- PWA installation (Req 20.1-20.4)
- HTTPS enforcement (Req 22.1-22.3)
- Dark theme with accent colors (Req 25.5, 26.1)
- Security headers (CSP, X-Frame-Options, etc.)

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.
