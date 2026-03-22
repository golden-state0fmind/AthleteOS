# Deployment Guide for AthleteOS

## Prerequisites

- Node.js 20.9.0 or higher (required by Next.js 16)
- Vercel account
- Anthropic API key

## Local Development

### Node Version Requirement

This project requires Node.js 20.9.0 or higher. If you're running an older version:

**Using nvm (recommended):**
```bash
nvm install 20
nvm use 20
```

**Or download from:**
https://nodejs.org/

### Setup Steps

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

4. Run development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## Vercel Deployment

### Method 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables:
```bash
vercel env add ANTHROPIC_API_KEY
```
Enter your API key when prompted.

5. Redeploy to apply environment variables:
```bash
vercel --prod
```

### Method 2: Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to https://vercel.com/new

3. Import your repository

4. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add environment variables:
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key
   - Environment: Production, Preview, Development

6. Click "Deploy"

### Method 3: One-Click Deploy

Use the "Deploy to Vercel" button in README.md (requires public repository).

## Post-Deployment

### Verify Deployment

1. Check that the site loads over HTTPS
2. Verify PWA manifest is accessible: `https://your-domain.vercel.app/manifest.json`
3. Test service worker registration in browser DevTools
4. Try installing the PWA on mobile device

### Environment Variables

Required environment variables in Vercel:
- `ANTHROPIC_API_KEY` - Your Anthropic API key

To update environment variables:
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Update the value
4. Redeploy the project

### Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

## Security Checklist

- ✅ HTTPS enforced (automatic on Vercel)
- ✅ API key stored in environment variables
- ✅ Security headers configured in next.config.ts
- ✅ Service Worker only registers on HTTPS
- ✅ CSP headers prevent XSS attacks
- ✅ No sensitive data in client-side code

## PWA Installation

### Testing PWA Locally

PWA features require HTTPS. To test locally:

1. Use Vercel preview deployment
2. Or use ngrok to create HTTPS tunnel:
```bash
npm run dev
# In another terminal:
ngrok http 3000
```

### Mobile Installation

**iOS (Safari):**
1. Open the deployed site in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

**Android (Chrome):**
1. Open the deployed site in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Install"

**Desktop (Chrome/Edge):**
1. Open the deployed site
2. Look for the install icon in the address bar
3. Click "Install"

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in your project settings to monitor:
- Page views
- Performance metrics
- Error rates

### Logs

View deployment and runtime logs:
```bash
vercel logs <deployment-url>
```

Or in Vercel dashboard: Project → Deployments → Select deployment → Logs

## Troubleshooting

### Build Fails

- Check Node.js version (must be ≥20.9.0)
- Verify all dependencies are installed
- Check for TypeScript errors: `npm run build`

### API Routes Not Working

- Verify `ANTHROPIC_API_KEY` is set in Vercel environment variables
- Check API route logs in Vercel dashboard
- Ensure API key has proper permissions

### PWA Not Installing

- Verify site is served over HTTPS
- Check manifest.json is accessible
- Verify service worker is registered (DevTools → Application → Service Workers)
- Ensure all required icons exist in public/icons/

### Service Worker Issues

- Clear browser cache and service worker
- Check for errors in DevTools → Console
- Verify sw.js is accessible at /sw.js
- Ensure HTTPS is enabled

## Performance Optimization

### Image Optimization

Next.js automatically optimizes images. Use the `<Image>` component:
```tsx
import Image from 'next/image';

<Image src="/path/to/image.png" alt="Description" width={500} height={300} />
```

### Code Splitting

Next.js automatically code-splits by route. For additional optimization:
```tsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./Component'));
```

### Caching Strategy

The service worker implements:
- Cache-first for static assets
- Network-only for API routes
- Offline fallback for navigation

## Updating the App

1. Make changes to your code
2. Commit and push to your repository
3. Vercel automatically deploys on push
4. Users will receive updates when they reload the app

### Force Update

To force users to update:
1. Increment the cache version in `public/sw.js`
2. Deploy the changes
3. Service worker will update on next visit

## Support

For issues:
- Check Vercel documentation: https://vercel.com/docs
- Check Next.js documentation: https://nextjs.org/docs
- Open an issue on GitHub
