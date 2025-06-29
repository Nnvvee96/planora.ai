# Next.js Migration Guide for Planora.ai

## Executive Summary

This document provides a comprehensive, surgical migration plan from Vite + React to Next.js 14 for Planora.ai. The migration is designed to be executed in small, safe steps to minimize risk and maintain application stability throughout the process.

**Migration Timeline**: 3-4 weeks  
**Risk Level**: Medium (mitigated through surgical approach)  
**Target**: Next.js 14 with App Router  
**Deployment**: Maintain Cloudflare Pages compatibility

## Table of Contents

1. [Pre-Migration Analysis](#pre-migration-analysis)
2. [Migration Strategy](#migration-strategy)
3. [Phase 1: Foundation Setup](#phase-1-foundation-setup)
4. [Phase 2: Environment & Configuration](#phase-2-environment--configuration)
5. [Phase 3: Core Architecture Migration](#phase-3-core-architecture-migration)
6. [Phase 4: Routing System Conversion](#phase-4-routing-system-conversion)
7. [Phase 5: Feature Migration](#phase-5-feature-migration)
8. [Phase 6: External Service Reconfiguration](#phase-6-external-service-reconfiguration)
9. [Phase 7: Optimization & Performance](#phase-7-optimization--performance)
10. [Phase 8: Deployment & Go-Live](#phase-8-deployment--go-live)
11. [Rollback Strategy](#rollback-strategy)
12. [Post-Migration Checklist](#post-migration-checklist)

## Pre-Migration Analysis

### Current Project Assessment

**Technology Stack:**
- **Build Tool**: Vite 5.4.19 with SWC
- **Framework**: React 18.3.1 + TypeScript
- **Routing**: React Router DOM 6.26.2
- **State Management**: Redux Toolkit 2.8.2
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Deployment**: Cloudflare Pages
- **Authentication**: Google OAuth + Email/Password

**Current File Structure Analysis:**
```
src/
├── features/ (11 features, 89 files)
├── pages/ (15 main pages)
├── components/ui/ (40+ shadcn components)
├── ui/ (atoms, molecules, organisms)
├── lib/ (utilities, Supabase client)
├── hooks/ (integration hooks)
├── store/ (Redux store)
└── utils/ (date, format utilities)
```

**Environment Variables to Migrate (12 variables):**
- `VITE_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VITE_SITE_URL` → `NEXT_PUBLIC_SITE_URL`
- `VITE_AUTH_REDIRECT_URL` → `NEXT_PUBLIC_AUTH_REDIRECT_URL`
- `VITE_ENABLE_GOOGLE_AUTH` → `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH`
- `VITE_ENABLE_APPLE_AUTH` → `NEXT_PUBLIC_ENABLE_APPLE_AUTH`
- `VITE_ENABLE_EMAIL_AUTH` → `NEXT_PUBLIC_ENABLE_EMAIL_AUTH`
- `VITE_API_BASE_URL` → `NEXT_PUBLIC_API_BASE_URL`
- `VITE_APP_URL` → `NEXT_PUBLIC_APP_URL`
- `VITE_GOOGLE_AUTH_REDIRECT_URI` → `NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URI`
- `VITE_APPLE_AUTH_REDIRECT_URI` → `NEXT_PUBLIC_APPLE_AUTH_REDIRECT_URI`
- `VITE_NODE_ENV` → `NODE_ENV`

**Routes to Migrate (25+ routes):**
- Public: `/`, `/login`, `/register`, `/reviews`, `/support`
- Auth: `/auth/callback`, `/auth/email-confirmation`, `/auth/reset-password`
- Protected: `/dashboard`, `/onboarding`, `/chat`, `/settings/*`, `/billing`
- Admin: `/admin`

## Migration Strategy

### Core Principles

1. **Surgical Approach**: Each step is small, testable, and reversible
2. **Parallel Development**: Build Next.js version alongside current Vite app
3. **Feature Parity**: Maintain 100% functionality throughout migration
4. **Zero Downtime**: Use feature flags and gradual rollout
5. **Architecture Preservation**: Maintain feature-first organization
6. **Performance First**: Leverage Next.js optimizations from day one

### Risk Mitigation

- **Backup Strategy**: Keep Vite version deployable throughout migration
- **Feature Flags**: Gradual rollout of migrated components
- **Automated Testing**: Comprehensive test suite for critical paths
- **Monitoring**: Real-time performance and error monitoring
- **Rollback Plan**: Immediate rollback capability at each phase

## Phase 1: Foundation Setup

### Step 1.1: Create Next.js Project Structure

**Duration**: 2 days  
**Risk Level**: Low  

**Actions:**
1. Create new directory: `planora-nextjs/`
2. Initialize Next.js 14 with TypeScript
3. Setup basic folder structure
4. Install core dependencies

**Commands:**
```bash
# Create new Next.js project
npx create-next-app@latest planora-nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project
cd planora-nextjs

# Install additional dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @reduxjs/toolkit react-redux
npm install @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install date-fns
```

**File Structure Setup:**
```
planora-nextjs/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── (routes)/
│   ├── components/
│   │   └── ui/
│   ├── features/
│   ├── lib/
│   ├── hooks/
│   ├── store/
│   └── utils/
├── public/
├── next.config.js
└── middleware.ts
```

### Step 1.2: Configure TypeScript and ESLint

**Duration**: 1 day  
**Risk Level**: Low  

**Actions:**
1. Copy and adapt TypeScript configuration
2. Setup ESLint rules to match current project
3. Configure path aliases
4. Setup Tailwind CSS configuration

**Files to Create/Modify:**
- `tsconfig.json`
- `next.config.js`
- `tailwind.config.ts`
- `.eslintrc.json`

### Step 1.3: Setup Development Environment

**Duration**: 1 day  
**Risk Level**: Low  

**Actions:**
1. Configure development scripts
2. Setup environment variable structure
3. Create basic layout component
4. Test development server

**Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## Phase 2: Environment & Configuration

### Step 2.1: Environment Variables Migration

**Duration**: 1 day  
**Risk Level**: Low  

**Actions:**
1. Create `.env.local` with all migrated variables
2. Update variable references in copied files
3. Test environment variable loading

**Environment File Structure:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
NEXT_PUBLIC_ENABLE_APPLE_AUTH=false
NEXT_PUBLIC_ENABLE_EMAIL_AUTH=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_APPLE_AUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Step 2.2: Next.js Configuration

**Duration**: 2 days  
**Risk Level**: Medium  

**Actions:**
1. Configure `next.config.js` with optimizations
2. Setup middleware for authentication
3. Configure image optimization
4. Setup path aliases

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: [
      'your-supabase-project.supabase.co',
      'lh3.googleusercontent.com'
    ],
    formats: ['image/webp', 'image/avif']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src')
    }
    return config
  },
  // Enable static exports for Cloudflare Pages compatibility
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

### Step 2.3: Middleware Setup

**Duration**: 2 days  
**Risk Level**: Medium  

**Actions:**
1. Create authentication middleware
2. Setup route protection
3. Handle redirects
4. Test middleware functionality

**middleware.ts:**
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = [
    '/dashboard',
    '/onboarding',
    '/chat',
    '/settings',
    '/billing',
    '/admin'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect unauthenticated users
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)
  
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Phase 3: Core Architecture Migration

### Step 3.1: Utilities and Libraries

**Duration**: 2 days  
**Risk Level**: Low  

**Actions:**
1. Copy `src/lib/` directory
2. Update Supabase client for Next.js
3. Copy `src/utils/` directory
4. Update import statements

**Supabase Client Migration:**
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()

// lib/supabase/server.ts (new file)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () => 
  createServerComponentClient({ cookies })
```

### Step 3.2: UI Components Migration

**Duration**: 3 days  
**Risk Level**: Low  

**Actions:**
1. Copy `src/components/ui/` directory (shadcn components)
2. Copy `src/ui/` directory (custom components)
3. Update import statements from `import.meta.env` to `process.env`
4. Test component rendering

**Import Statement Updates:**
```typescript
// Before (Vite)
const apiUrl = import.meta.env.VITE_API_BASE_URL

// After (Next.js)
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
```

### Step 3.3: Store and State Management

**Duration**: 2 days  
**Risk Level**: Medium  

**Actions:**
1. Copy Redux store configuration
2. Setup Redux with Next.js SSR
3. Update store providers
4. Test state management

**Store Provider for Next.js:**
```typescript
// store/StoreProvider.tsx
'use client'

import { Provider } from 'react-redux'
import { store } from './storeApi'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
```

## Phase 4: Routing System Conversion

### Step 4.1: App Router Structure

**Duration**: 3 days  
**Risk Level**: High  

**Actions:**
1. Create app router structure
2. Convert each route to Next.js format
3. Setup layouts and templates
4. Test routing functionality

**Route Mapping:**
```
Current Route → Next.js App Router

/ → app/page.tsx
/login → app/login/page.tsx
/register → app/register/page.tsx
/dashboard → app/dashboard/page.tsx
/onboarding → app/onboarding/page.tsx
/chat → app/chat/page.tsx
/settings → app/settings/layout.tsx + page.tsx
/settings/notifications → app/settings/notifications/page.tsx
/settings/privacy → app/settings/privacy/page.tsx
/billing → app/billing/page.tsx
/auth/callback → app/auth/callback/page.tsx
/auth/email-confirmation → app/auth/email-confirmation/page.tsx
/auth/reset-password → app/auth/reset-password/page.tsx
/admin → app/admin/page.tsx
/support → app/support/page.tsx
/reviews → app/reviews/page.tsx
```

### Step 4.2: Layout Components

**Duration**: 2 days  
**Risk Level**: Medium  

**Actions:**
1. Create root layout
2. Setup nested layouts for protected routes
3. Migrate navigation components
4. Test layout functionality

**Root Layout:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import { StoreProvider } from '@/store/StoreProvider'
import { QueryProvider } from '@/lib/QueryProvider'
import { AuthProvider } from '@/features/auth/components/AuthProvider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Planora.ai - AI-Powered Travel Planning',
  description: 'Plan your perfect trip with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
```

### Step 4.3: Protected Route Implementation

**Duration**: 2 days  
**Risk Level**: Medium  

**Actions:**
1. Implement server-side auth checking
2. Create protected layout components
3. Setup redirect logic
4. Test authentication flow

**Protected Layout:**
```typescript
// app/(protected)/layout.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/Navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-planora-background-dark">
      <Navigation />
      <main>{children}</main>
    </div>
  )
}
```

## Phase 5: Feature Migration

### Step 5.1: Authentication Feature

**Duration**: 4 days  
**Risk Level**: High  

**Actions:**
1. Migrate auth components
2. Update Supabase auth helpers
3. Implement server-side session handling
4. Test complete auth flow

**Priority Order:**
1. `features/auth/services/` (auth services)
2. `features/auth/components/` (auth components)
3. `features/auth/hooks/` (auth hooks)
4. `features/auth/authApi.ts` (auth API)

**Key Changes:**
- Update session management for SSR
- Implement server actions for auth operations
- Update redirect handling

### Step 5.2: User Profile Feature

**Duration**: 3 days  
**Risk Level**: Medium  

**Actions:**
1. Migrate user profile components
2. Update profile services
3. Implement SSR for profile data
4. Test profile functionality

### Step 5.3: Travel Features

**Duration**: 5 days  
**Risk Level**: Medium  

**Actions:**
1. Migrate travel planning features
2. Migrate travel preferences
3. Update chat functionality
4. Test all travel-related features

**Features to Migrate:**
- `features/travel-planning/`
- `features/travel-preferences/`
- `features/chat/`
- `features/location-data/`

### Step 5.4: Remaining Features

**Duration**: 3 days  
**Risk Level**: Low  

**Actions:**
1. Migrate admin features
2. Migrate subscription features
3. Migrate dev tools
4. Test all remaining features

## Phase 6: External Service Reconfiguration

### Step 6.1: Google OAuth Configuration

**Duration**: 1 day  
**Risk Level**: Medium  

**Actions:**
1. Update Google Cloud Console settings
2. Update redirect URIs
3. Test Google authentication
4. Update environment variables

**Google Cloud Console Changes:**
- Update authorized redirect URIs to Next.js routes
- Verify domain settings
- Test OAuth flow

### Step 6.2: Supabase Configuration

**Duration**: 2 days  
**Risk Level**: Medium  

**Actions:**
1. Update Supabase project settings
2. Configure auth callbacks for Next.js
3. Update RLS policies if needed
4. Test database connections

**Supabase Updates:**
- Site URL configuration
- Auth callback URLs
- CORS settings
- Edge function compatibility

### Step 6.3: Cloudflare Pages Configuration

**Duration**: 2 days  
**Risk Level**: High  

**Actions:**
1. Update build settings
2. Configure environment variables
3. Update headers and redirects
4. Test deployment

**Build Configuration:**
```bash
# Build command
npm run build

# Build output directory
out

# Environment variables
# (All NEXT_PUBLIC_* variables)
```

## Phase 7: Optimization & Performance

### Step 7.1: SSR/SSG Implementation

**Duration**: 3 days  
**Risk Level**: Medium  

**Actions:**
1. Implement SSG for marketing pages
2. Implement SSR for dynamic content
3. Optimize loading strategies
4. Test performance improvements

**Page Strategy:**
- **SSG**: Landing page, reviews, support
- **SSR**: Dashboard, chat, user-specific content
- **Client-side**: Interactive components

### Step 7.2: Performance Optimization

**Duration**: 2 days  
**Risk Level**: Low  

**Actions:**
1. Implement code splitting
2. Optimize images
3. Setup caching strategies
4. Performance testing

**Optimizations:**
- Dynamic imports for large components
- Image optimization with Next.js Image
- Font optimization
- Bundle analysis and optimization

### Step 7.3: SEO Optimization

**Duration**: 2 days  
**Risk Level**: Low  

**Actions:**
1. Implement metadata API
2. Setup structured data
3. Configure sitemap
4. Test SEO improvements

## Phase 8: Deployment & Go-Live

### Step 8.1: Staging Deployment

**Duration**: 2 days  
**Risk Level**: Medium  

**Actions:**
1. Deploy to staging environment
2. Run comprehensive testing
3. Performance benchmarking
4. Security testing

### Step 8.2: Production Deployment

**Duration**: 1 day  
**Risk Level**: High  

**Actions:**
1. Final production deployment
2. DNS updates if needed
3. Monitor for issues
4. Performance monitoring

### Step 8.3: Post-Deployment Monitoring

**Duration**: 3 days  
**Risk Level**: Medium  

**Actions:**
1. Monitor application performance
2. Track user behavior
3. Monitor error rates
4. Collect feedback

## Rollback Strategy

### Immediate Rollback (< 5 minutes)

1. **DNS Rollback**: Switch DNS back to Vite deployment
2. **Cloudflare Rollback**: Use Cloudflare's rollback feature
3. **Environment Restoration**: Restore original environment variables

### Partial Rollback Options

1. **Feature Flags**: Disable specific migrated features
2. **Route-Level Rollback**: Redirect specific routes to old app
3. **User-Segment Rollback**: Rollback for specific user groups

### Rollback Triggers

- **Error Rate**: > 5% error rate increase
- **Performance**: > 50% performance degradation
- **User Complaints**: > 10 user complaints in 1 hour
- **Critical Bug**: Any authentication or data loss issues

## Testing Strategy

### Automated Testing

1. **Unit Tests**: All components and utilities
2. **Integration Tests**: Feature-level testing
3. **E2E Tests**: Critical user journeys
4. **Performance Tests**: Load and performance testing

### Manual Testing

1. **Authentication Flow**: Complete auth testing
2. **User Journeys**: All major user paths
3. **Cross-Browser Testing**: Chrome, Firefox, Safari, Edge
4. **Mobile Testing**: iOS and Android devices

### Testing Checklist

- [ ] User registration and login
- [ ] Google OAuth flow
- [ ] Password reset flow
- [ ] Onboarding process
- [ ] Travel planning features
- [ ] Chat functionality
- [ ] Settings and preferences
- [ ] Billing and subscriptions
- [ ] Admin functionality
- [ ] Mobile responsiveness
- [ ] Performance benchmarks
- [ ] SEO metadata
- [ ] Error handling
- [ ] Security features

## Post-Migration Checklist

### Immediate (Day 1)

- [ ] All routes working correctly
- [ ] Authentication flow functional
- [ ] Database connections stable
- [ ] External services connected
- [ ] Error monitoring active
- [ ] Performance monitoring active

### Short-term (Week 1)

- [ ] User feedback collected
- [ ] Performance benchmarks met
- [ ] SEO improvements verified
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team training completed

### Long-term (Month 1)

- [ ] Performance optimizations implemented
- [ ] A/B testing setup
- [ ] Advanced Next.js features explored
- [ ] Development workflow optimized
- [ ] Monitoring and alerting refined

## Risk Assessment Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Authentication Failure | Medium | High | Comprehensive testing, rollback plan |
| Performance Degradation | Low | Medium | Performance testing, optimization |
| Data Loss | Low | High | Database backups, careful migration |
| External Service Issues | Medium | Medium | Service monitoring, fallback options |
| Deployment Failure | Low | High | Staging testing, rollback automation |
| User Experience Issues | Medium | Medium | User testing, feedback collection |

## Success Criteria

### Technical Metrics

- **Performance**: Page load times < 2 seconds
- **Availability**: 99.9% uptime
- **Error Rate**: < 1% error rate
- **SEO**: Improved search rankings
- **Bundle Size**: Optimized bundle sizes

### Business Metrics

- **User Satisfaction**: > 95% positive feedback
- **Conversion Rate**: Maintained or improved
- **Feature Adoption**: All features working
- **Support Tickets**: < 10% increase
- **Revenue Impact**: No negative impact

## Timeline Summary

| Phase | Duration | Effort | Risk |
|-------|----------|---------|------|
| Phase 1: Foundation | 4 days | 32 hours | Low |
| Phase 2: Environment | 5 days | 40 hours | Medium |
| Phase 3: Architecture | 7 days | 56 hours | Medium |
| Phase 4: Routing | 7 days | 56 hours | High |
| Phase 5: Features | 15 days | 120 hours | High |
| Phase 6: External Services | 5 days | 40 hours | Medium |
| Phase 7: Optimization | 7 days | 56 hours | Medium |
| Phase 8: Deployment | 6 days | 48 hours | High |
| **Total** | **56 days** | **448 hours** | **Medium** |

## Resource Requirements

### Development Team

- **1 Senior Full-Stack Developer**: Lead migration effort
- **1 DevOps Engineer**: Deployment and infrastructure
- **1 QA Engineer**: Testing and quality assurance
- **1 Product Manager**: Coordination and stakeholder communication

### Infrastructure

- **Staging Environment**: Full replica of production
- **Testing Environment**: Automated testing setup
- **Monitoring Tools**: Performance and error monitoring
- **Backup Systems**: Data backup and recovery

## Detailed File Migration Plan

### Critical Files Requiring Manual Migration

**Environment Variable Updates (12 files):**
1. `src/lib/supabase/client.ts` - Update env vars
2. `src/features/auth/services/authProviderService.ts` - VITE_SITE_URL
3. `src/features/auth/services/googleAuthService.ts` - VITE_AUTH_REDIRECT_URL
4. `src/features/auth/services/emailVerificationService.ts` - VITE_SITE_URL
5. `src/pages/DebugScreen.tsx` - Multiple VITE_ vars
6. `src/pages/Register.tsx` - VITE_ENABLE_APPLE_AUTH
7. `src/pages/Login.tsx` - VITE_ENABLE_APPLE_AUTH
8. `src/constants/appConstants.ts` - VITE_API_BASE_URL
9. `src/App.tsx` - VITE_SUPABASE_URL, VITE_ENABLE_GOOGLE_AUTH
10. `scripts/generate-types.ts` - VITE_SUPABASE_TEST_URL

**Route Component Migration:**
1. `src/pages/LandingPage/LandingPage.tsx` → `app/page.tsx`
2. `src/pages/Login.tsx` → `app/login/page.tsx`
3. `src/pages/Register.tsx` → `app/register/page.tsx`
4. `src/pages/Dashboard.tsx` → `app/dashboard/page.tsx`
5. `src/pages/Onboarding/Onboarding.tsx` → `app/onboarding/page.tsx`
6. `src/pages/Chat.tsx` → `app/chat/page.tsx`
7. `src/pages/Billing.tsx` → `app/billing/page.tsx`
8. `src/pages/TravelPreferencesPage.tsx` → `app/preferences/page.tsx`
9. `src/pages/Settings/Notifications.tsx` → `app/settings/notifications/page.tsx`
10. `src/pages/Settings/PrivacySecurity.tsx` → `app/settings/privacy/page.tsx`
11. `src/pages/SupportPage.tsx` → `app/support/page.tsx`
12. `src/pages/ReviewsPage.tsx` → `app/reviews/page.tsx`
13. `src/pages/Admin/AdminPage.tsx` → `app/admin/page.tsx`

### Feature API Migration Priority

**High Priority (Core functionality):**
1. `src/features/auth/authApi.ts` - Authentication system
2. `src/features/user-profile/userProfileApi.ts` - User management
3. `src/store/storeApi.ts` - Redux store configuration

**Medium Priority (User features):**
4. `src/features/travel-preferences/travelPreferencesApi.ts`
5. `src/features/travel-planning/travelPlanningApi.ts`
6. `src/features/chat/chatApi.ts`

**Low Priority (Admin/utility features):**
7. `src/features/admin/adminApi.ts`
8. `src/features/subscriptions/subscriptionsApi.ts`
9. `src/features/dev-tools/devToolsApi.ts`

## External Service Configuration Details

### Google Cloud Console Updates

**OAuth 2.0 Client IDs:**
1. Navigate to Google Cloud Console
2. Select your project
3. Go to APIs & Services > Credentials
4. Edit OAuth 2.0 Client ID
5. Update Authorized redirect URIs:
   - Remove: `https://yourapp.com/auth/callback` (if different)
   - Add: `https://yourapp.com/auth/callback` (Next.js format)
6. Update Authorized JavaScript origins if needed

### Supabase Project Configuration

**Authentication Settings:**
1. Go to Supabase Dashboard
2. Navigate to Authentication > Settings
3. Update Site URL: `https://your-nextjs-app.com`
4. Update Redirect URLs:
   - Add: `https://your-nextjs-app.com/auth/callback`
   - Add: `http://localhost:3000/auth/callback` (development)

**Database Configuration:**
- No changes required for database schema
- RLS policies remain the same
- Edge functions compatible with Next.js

### Cloudflare Pages Configuration

**Build Settings:**
```yaml
Build command: npm run build
Build output directory: out
Root directory: /
Node.js version: 18.x
```

**Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://your-domain.com/auth/callback
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
NEXT_PUBLIC_ENABLE_APPLE_AUTH=false
NEXT_PUBLIC_ENABLE_EMAIL_AUTH=true
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URI=https://your-domain.com/auth/callback
NEXT_PUBLIC_APPLE_AUTH_REDIRECT_URI=https://your-domain.com/auth/callback
NODE_ENV=production
```

**Headers Configuration Update:**
```
/*
  # Update CSP for Next.js
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://cloudflareinsights.com https://challenges.cloudflare.com https://js.stripe.com https://cdn.gpteng.co /_next/static/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://m.stripe.network data: /_next/static/; font-src 'self' https://fonts.gstatic.com data: /_next/static/; img-src 'self' data: https: blob: /_next/; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cloudflareinsights.com https://api.stripe.com https://m.stripe.com; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https://js.stripe.com https://m.stripe.network https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self' https://*.supabase.co https://api.stripe.com;
```

## Conclusion

This migration plan provides a comprehensive, surgical approach to migrating Planora.ai from Vite to Next.js. The plan prioritizes safety, maintains feature parity, and leverages Next.js optimizations for improved performance and SEO.

The surgical approach with small, testable steps ensures that any issues can be quickly identified and resolved without impacting the overall migration timeline. The detailed rollback strategy provides confidence that the migration can be safely executed without risk to the production application.

Upon completion, Planora.ai will benefit from:
- Improved SEO and search rankings
- Better performance with SSR/SSG
- Enhanced developer experience
- Future-proofed architecture
- Improved scalability for SaaS growth

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: Before migration start  
**Owner**: Development Team
