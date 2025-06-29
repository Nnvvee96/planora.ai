# Planora.ai Architecture Guide

This document outlines the architectural principles, patterns, and comprehensive project structure of Planora.ai. This serves as both a development guide and a complete reference for understanding what exists in the codebase and why.

## 🏆 **Current Status: Production-Ready Architecture**

The Planora.ai codebase has achieved **gold standard** architectural compliance through comprehensive cleanup phases:
- **✅ Zero linting errors and warnings**
- **✅ Perfect TypeScript strict mode compliance**
- **✅ Simplified authentication system with standard Supabase patterns**
- **✅ Standardized component imports and organization**
- **✅ Clean backend with no orphaned resources**
- **✅ Subscription-based tier management (Explorer, Wanderer Pro, Global Elite)**
- **✅ Comprehensive security configuration**
- **✅ Enterprise-grade service layer with monitoring**

## Table of Contents

1. [Complete Project Visualization](#complete-project-visualization)
2. [Core Architectural Principles](#core-architectural-principles)
3. [Feature Architecture](#feature-architecture)
4. [UI Component System](#ui-component-system)
5. [Service Layer Architecture](#service-layer-architecture)
6. [Database & Backend](#database--backend)
7. [Development Tools & Configuration](#development-tools--configuration)
8. [Quality Assurance](#quality-assurance)

## Complete Project Visualization

### 🗂️ **Root Directory Structure**

```
planora.ai/
├── 📁 src/                          # Main application source code
├── 📁 public/                       # Static assets and PWA configuration
├── 📁 docs/                         # Comprehensive documentation
├── 📁 config/                       # Development and build configuration
├── 📁 supabase/                     # Database schema and edge functions
├── 📁 scripts/                      # Build and validation scripts
├── 📄 package.json                  # Dependencies and scripts
├── 📄 README.md                     # Project overview and setup
├── 📄 tailwind.config.ts           # Tailwind CSS configuration
├── 📄 vite.config.ts               # Vite build configuration
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 .lintstagedrc.json          # Lint-staged configuration for pre-commit hooks
├── 📄 SUPABASE_AUTH_SECURITY_GUIDE.md # Security guide for authentication setup
├── 📄 NEXTJS_MIGRATION_GUIDE.md   # Migration guide from Next.js to Vite
├── 📁 functions/                  # Edge function middleware
│   └── 📄 _middleware.ts          # CORS and routing middleware for edge functions└── 📄 .env.example                 # Environment variables template
```

### 🎯 **Source Code Architecture (`src/`)**

```
src/
├── 📄 App.tsx                      # Main application component with routing
├── 📄 main.tsx                     # Application entry point with providers
├── 📄 index.css                    # Global styles and Tailwind imports
├── 📄 App.css                      # Application-specific styles
├── 📄 vite-env.d.ts               # Vite environment type definitions
│
├── 📁 features/                    # Feature-first architecture
│   ├── 📁 auth/                   # Authentication & authorization
│   │   ├── 📄 authApi.ts          # Public API boundary
│   │   ├── 📁 components/         # Auth UI components
│   │   │   ├── 📄 AuthProvider.tsx           # Auth context provider
│   │   │   ├── 📄 AuthCallback.tsx           # OAuth callback handler
│   │   │   ├── 📄 ProtectedRoute.tsx         # Route protection
│   │   │   ├── 📄 GoogleLoginButton.tsx      # Google OAuth button
│   │   │   ├── 📄 EmailConfirmation.tsx      # Email verification
│   │   │   ├── 📄 EmailChangeVerification.tsx # Email change flow
│   │   │   ├── 📄 ForgotPassword.tsx         # Password reset request
│   │   │   └── 📄 ResetPassword.tsx          # Password reset form
│   │   ├── 📁 services/           # Auth business logic
│   │   │   ├── 📄 supabaseAuthService.ts     # Main auth orchestrator
│   │   │   ├── 📄 emailAuthService.ts        # Email/password auth
│   │   │   ├── 📄 googleAuthService.ts       # Google OAuth integration
│   │   │   ├── 📄 sessionService.ts          # Session management
│   │   │   ├── 📄 authProviderService.ts     # Provider detection
│   │   │   ├── 📄 authProfileService.ts      # Profile integration
│   │   │   ├── 📄 authCallbackService.ts     # Callback handling
│   │   │   ├── �� authSessionManager.ts      # Session lifecycle
│   │   │   └── 📄 emailVerificationService.ts # Email verification
│   │   ├── 📁 hooks/              # Auth React hooks
│   │   │   ├── 📄 useAuth.ts                 # Main auth hook
│   │   │   ├── 📄 useAuthContext.ts          # Context consumer
│   │   │   ├── 📄 useAuthIntegration.ts      # Cross-feature integration
│   │   │   └── 📄 useAuthProfileIntegration.ts # Profile integration
│   │   ├── 📁 context/            # Auth context definitions
│   │   │   └── 📄 authContext.ts             # Auth context setup
│   │   ├── 📁 types/              # Auth type definitions
│   │   │   └── 📄 authTypes.ts               # All auth-related types
│   │   ├── 📁 helpers/            # Auth utility functions
│   │   │   └── 📄 googleAuthHelper.ts        # Google auth utilities
│   │   └── 📁 routes/             # Auth routing configuration
│   │       └── 📄 authRoutes.tsx             # Auth route definitions
│   │
│   ├── 📁 user-profile/           # User profile management
│   │   ├── 📄 userProfileApi.ts   # Public API boundary
│   │   ├── 📁 components/         # Profile UI components
│   │   │   ├── 📄 UserProfileProvider.tsx    # Profile context provider
│   │   │   ├── 📄 UserProfileMenu.tsx        # Profile dropdown menu
│   │   │   ├── 📄 AccountRecoveryPage.tsx    # Account recovery
│   │   │   └── 📁 dialogs/                   # Profile dialog components
│   │   │       ├── 📄 ProfileDialog.tsx      # Profile editing dialog
│   │   │       ├── 📄 SettingsDialog.tsx     # Settings dialog
│   │   │       └── 📄 DeleteAccountDialog.tsx # Account deletion
│   │   ├── 📁 services/           # Profile business logic
│   │   │   ├── 📄 userProfileService.ts      # Main profile service
│   │   │   ├── 📁 mappers/                   # Data transformation
│   │   │   │   └── 📄 profileMappingService.ts # Profile mapping
│   │   │   └── 📁 providers/                 # External integrations
│   │   │       └── 📄 googleProfileService.ts # Google profile data
│   │   ├── 📁 hooks/              # Profile React hooks
│   │   │   ├── 📄 useUserProfile.ts          # Main profile hook
│   │   │   └── 📄 useUserProfileAuthIntegration.ts # Auth integration
│   │   ├── 📁 context/            # Profile context
│   │   │   └── 📄 userProfileContext.ts      # Profile context setup
│   │   ├── 📁 types/              # Profile type definitions
│   │   │   └── 📄 profileTypes.ts            # All profile-related types
│   │   └── 📁 utils/              # Profile utilities
│   │       └── 📄 userProfileMappers.ts      # Data mapping utilities
│   │
│   ├── 📁 chat/                   # AI chat functionality
│   │   ├── 📄 chatApi.ts          # Public API boundary
│   │   ├── 📁 components/         # Chat UI components
│   │   │   ├── 📄 ChatHeader.tsx             # Chat interface header
│   │   │   ├── 📄 ChatInput.tsx              # Message input component
│   │   │   ├── 📄 ChatMessage.tsx            # Message display component
│   │   │   ├── 📄 ConversationSidebar.tsx    # Chat history sidebar
│   │   │   ├── 📄 TravelPersonaEditPanel.tsx # Travel preferences editor
│   │   │   └── 📁 shared/                    # Shared chat components
│   │   ├── 📁 services/           # Chat business logic
│   │   │   └── 📄 chatService.ts             # Chat API integration
│   │   ├── 📁 hooks/              # Chat React hooks
│   │   │   └── 📄 useChatState.ts            # Chat state management
│   │   └── 📁 types/              # Chat type definitions
│   │       └── 📄 chatTypes.ts               # All chat-related types
│   │
│   ├── 📁 travel-preferences/     # Travel preference management
│   │   ├── 📄 travelPreferencesApi.ts # Public API boundary
│   │   ├── 📁 components/         # Preference UI components
│   │   │   ├── 📄 TravelPreferencesPanel.tsx # Main preferences panel
│   │   │   └── 📁 TravelPreferencesPanel/    # Panel subcomponents
│   │   │       ├── 📁 components/sections/   # Preference sections
│   │   │       │   ├── 📄 BudgetSection.tsx           # Budget preferences
│   │   │       │   ├── 📄 AccommodationSection.tsx    # Accommodation prefs
│   │   │       │   ├── 📄 TravelDurationSection.tsx   # Duration settings
│   │   │       │   ├── 📄 PlanningIntentSection.tsx   # Planning goals
│   │   │       │   ├── 📄 LocationSection.tsx         # Location preferences
│   │   │       │   ├── 📄 FlightSection.tsx           # Flight preferences
│   │   │       │   └── 📄 DepartureSection.tsx        # Departure settings
│   │   │       ├── 📁 components/shared/     # Shared preference components
│   │   │       │   └── 📄 SimpleCheckboxCard.tsx     # Simple checkbox
│   │   │       ├── 📁 services/              # Preference form services
│   │   │       │   └── 📄 travelPreferencesFormService.ts # Form logic
│   │   │       └── 📁 types/                 # Form-specific types
│   │   │           └── 📄 travelPreferencesFormTypes.ts # Form types
│   │   ├── 📁 services/           # Preference business logic
│   │   │   └── 📄 travelPreferencesService.ts # Main preference service
│   │   ├── 📁 hooks/              # Preference React hooks
│   │   │   └── 📄 useTravelPreferences.ts    # Preference state hook
│   │   └── 📁 types/              # Preference type definitions
│   │       └── 📄 travelPreferencesTypes.ts  # All preference types
│   │
│   ├── 📁 travel-planning/        # Trip planning functionality
│   │   ├── 📄 travelPlanningApi.ts # Public API boundary
│   │   ├── 📁 components/         # Planning UI components
│   │   │   └── 📄 TravelCards.tsx            # Travel card components
│   │   └── 📁 types/              # Planning type definitions
│   │       └── 📄 travelPlanningTypes.ts     # All planning types
│   │
│   ├── 📁 subscriptions/          # Subscription management
│   │   ├── 📄 subscriptionsApi.ts # Public API boundary
│   │   ├── 📁 services/           # Subscription business logic
│   │   │   └── 📄 subscriptionService.ts     # Stripe integration
│   │   └── 📁 types/              # Subscription type definitions
│   │       └── 📄 subscriptionTypes.ts       # All subscription types
│   │
│   ├── 📁 location-data/          # Location data management
│   │   ├── 📄 locationDataApi.ts  # Public API boundary
│   │   └── 📁 data/               # Static location data
│   │       └── 📄 countryCityData.ts         # Country/city datasets
│   │
│   ├── 📁 dashboard/              # Dashboard functionality
│   │   ├── 📄 dashboardApi.ts     # Public API boundary
│   │   └── 📁 components/         # Dashboard UI components
│   │       └── 📄 QuickActionsWidget.tsx     # Quick action buttons
│   │
│   ├── 📁 error-handling/         # Global error management
│   │   ├── 📄 errorHandlingApi.ts # Public API boundary
│   │   └── 📁 services/           # Error handling services
│   │       └── 📄 errorService.ts            # Error logging/reporting
│   │
│   └── 📁 dev-tools/              # Development utilities
│       ├── 📄 devToolsApi.ts      # Public API boundary
│       └── 📁 components/         # Dev tool components
│           └── 📄 TestModeIndicator.tsx      # Test mode indicator
│
├── 📁 pages/                      # Page-level components
│   ├── 📄 Dashboard.tsx           # Main dashboard page
│   ├── 📄 Login.tsx               # Login page
│   ├── 📄 Register.tsx            # Registration page
│   ├── 📄 Chat.tsx                # Chat interface page
│   ├── 📄 Billing.tsx             # Billing and subscription page
│   ├── 📄 SavedTrips.tsx          # Saved trips page
│   ├── 📄 TravelPreferencesPage.tsx # Travel preferences page
│   ├── 📄 ReviewsPage.tsx         # Reviews and testimonials
│   ├── 📄 SupportPage.tsx         # Customer support page
│   ├── 📄 DebugScreen.tsx         # Development debug interface
│   ├── 📄 NotFound.tsx            # 404 error page
│   ├── 📁 LandingPage/            # Landing page components
│   │   ├── 📄 LandingPage.tsx     # Main landing page
│   │   ├── 📁 components/         # Landing page sections
│   │   │   ├── 📄 HeroSection.tsx            # Hero/banner section
│   │   │   ├── 📄 FeaturesSection.tsx        # Features showcase
│   │   │   ├── 📄 HowItWorksSection.tsx      # How it works explanation
│   │   │   ├── 📄 PricingSection.tsx         # Pricing tiers
│   │   │   ├── 📄 TechnologySection.tsx      # Technology stack
│   │   │   ├── 📄 FAQSection.tsx             # Frequently asked questions
│   │   │   ├── 📄 UserStoriesSection.tsx     # User testimonials
│   │   │   └── 📄 CTASection.tsx             # Call-to-action
│   │   └── 📁 data/               # Landing page data
│   │       ├── 📄 faqItems.ts                # FAQ data
│   │       ├── 📄 mockReviews.ts             # Review data
│   │       └── 📄 pricingTiers.ts            # Pricing information
│   ├── 📁 Onboarding/             # User onboarding flow
│   │   ├── 📄 Onboarding.tsx      # Main onboarding component
│   │   ├── 📁 components/         # Onboarding components
│   │   │   ├── 📁 steps/                     # Onboarding step components
│   │   │   │   ├── 📄 BudgetRangeStep.tsx           # Budget selection
│   │   │   │   ├── 📄 BudgetToleranceStep.tsx       # Budget flexibility
│   │   │   │   ├── 📄 TravelDurationStep.tsx        # Trip duration prefs
│   │   │   │   ├── 📄 PlanningIntentStep.tsx        # Planning goals
│   │   │   │   ├── 📄 AccommodationTypesStep.tsx    # Accommodation types
│   │   │   │   ├── 📄 AccommodationPreferencesStep.tsx # Accommodation prefs
│   │   │   │   ├── 📄 FlightPreferencesStep.tsx     # Flight preferences
│   │   │   │   └── 📄 LocationPreferencesStep.tsx   # Location preferences
│   │   │   └── 📁 shared/                   # Shared onboarding components
│   │   │       └── 📄 OptionItem.tsx                # Option item component
│   │   ├── 📁 services/           # Onboarding business logic
│   │   │   └── 📄 onboardingService.ts       # Onboarding flow logic
│   │   └── 📁 types/              # Onboarding type definitions
│   │       └── 📄 onboardingTypes.ts         # All onboarding types
│   └── 📁 Settings/               # Settings pages
│       ├── 📄 Notifications.tsx   # Notification preferences
│       └── 📄 PrivacySecurity.tsx # Privacy and security settings
│
├── 📁 ui/                         # Custom UI component system (Atomic Design)
│   ├── 📁 atoms/                  # Fundamental building blocks
│   │   ├── 📄 Button.tsx          # Enhanced button with custom variants
│   │   ├── 📄 Badge.tsx           # Badge component with variants
│   │   ├── 📄 Input.tsx           # Enhanced input with focus styling
│   │   ├── 📄 Textarea.tsx        # Enhanced textarea component
│   │   ├── 📄 Label.tsx           # Enhanced label component
│   │   ├── 📄 Card.tsx            # Enhanced card with custom styling
│   │   ├── 📄 Logo.tsx            # Planora logo component
│   │   ├── 📄 TravelAvatar.tsx    # Travel-themed avatar component
│   │   └── 📄 GradientButton.tsx  # Gradient button variant
│   ├── 📁 molecules/              # Combinations of atoms
│   │   ├── 📄 FeatureCard.tsx     # Feature showcase card
│   │   ├── 📄 CheckboxCard.tsx    # Unified checkbox card component with boolean and multi-select variants│   │   └── 📄 TripCard.tsx        # Trip display card component
│   ├── 📁 organisms/              # Complex UI sections
│   │   ├── 📄 Navigation.tsx      # Main navigation component
│   │   ├── 📄 Footer.tsx          # Site footer component
│   │   ├── 📄 ErrorBoundary.tsx   # Error boundary wrapper
│   │   ├── 📄 FaqAccordion.tsx    # FAQ accordion component
│   │   ├── 📄 ReviewCard.tsx      # Review/testimonial card
│   │   ├── 📄 EarthScene.tsx      # 3D Earth visualization
│   │   ├── 📄 HolographicEarth.tsx # Holographic Earth effect
│   │   └── 📄 VanillaEarthScene.tsx # Vanilla JS Earth scene
│   └── 📁 hooks/                  # UI-specific hooks
│       └── 📄 useClientOnly.ts    # Client-side only hook
│
├── 📁 components/                 # Third-party and library components
│   ├── 📄 AppWrapper.tsx          # App wrapper component
│   └── 📁 ui/                     # ShadCN/UI components
│       ├── 📄 button.tsx          # Base ShadCN button
│       ├── 📄 card.tsx            # Base ShadCN card
│       ├── 📄 input.tsx           # Base ShadCN input
│       ├── 📄 label.tsx           # Base ShadCN label
│       ├── 📄 badge.tsx           # Base ShadCN badge
│       ├── 📄 textarea.tsx        # Base ShadCN textarea
│       ├── 📄 form.tsx            # Form components
│       ├── 📄 dialog.tsx          # Dialog components
│       ├── 📄 alert.tsx           # Alert components
│       ├── 📄 toast.tsx           # Toast notification
│       ├── 📄 toaster.tsx         # Toast container
│       ├── 📄 tabs.tsx            # Tab components
│       ├── 📄 calendar.tsx        # Calendar component
│       ├── 📄 DatePickerInput.tsx # Date picker input
│       ├── 📄 dropdown-menu.tsx   # Dropdown menu
│       ├── 📄 select.tsx          # Select component
│       ├── 📄 checkbox.tsx        # Checkbox component
│       ├── 📄 radio-group.tsx     # Radio group
│       ├── 📄 switch.tsx          # Switch toggle
│       ├── 📄 slider.tsx          # Slider input
│       ├── 📄 progress.tsx        # Progress bar
│       ├── 📄 avatar.tsx          # Avatar component
│       ├── 📄 skeleton.tsx        # Loading skeleton
│       ├── 📄 separator.tsx       # Visual separator
│       ├── 📄 scroll-area.tsx     # Scrollable area
│       ├── 📄 sheet.tsx           # Sheet/drawer component
│       ├── 📄 sidebar.tsx         # Sidebar component
│       ├── 📄 tooltip.tsx         # Tooltip component
│       ├── 📄 popover.tsx         # Popover component
│       ├── 📄 hover-card.tsx      # Hover card
│       ├── 📄 context-menu.tsx    # Context menu
│       ├── 📄 menubar.tsx         # Menu bar
│       ├── 📄 navigation-menu.tsx # Navigation menu
│       ├── 📄 breadcrumb.tsx      # Breadcrumb navigation
│       ├── 📄 pagination.tsx      # Pagination component
│       ├── 📄 command.tsx         # Command palette
│       ├── 📄 collapsible.tsx     # Collapsible content
│       ├── 📄 accordion.tsx       # Accordion component
│       ├── 📄 table.tsx           # Table components
│       ├── 📄 chart.tsx           # Chart components
│       ├── 📄 carousel.tsx        # Carousel component
│       ├── 📄 toggle.tsx          # Toggle component
│       ├── 📄 toggle-group.tsx    # Toggle group
│       ├── 📄 alert-dialog.tsx    # Alert dialog
│       ├── 📄 drawer.tsx          # Drawer component
│       ├── 📄 resizable.tsx       # Resizable panels
│       ├── 📄 aspect-ratio.tsx    # Aspect ratio container
│       ├── 📄 input-otp.tsx       # OTP input
│       ├── 📄 sonner.tsx          # Sonner toast
│       ├── 📁 variants/           # Component variants
│       │   ├── 📄 buttonVariants.ts          # Button variant definitions
│       │   ├── 📄 badgeVariants.ts           # Badge variant definitions
│       │   └── 📄 toggleVariants.ts          # Toggle variant definitions
│       ├── 📁 styles/             # Component styles
│       │   └── 📄 navigationMenuStyles.ts    # Navigation menu styles
│       ├── 📁 utils/              # UI utilities
│       │   └── 📄 toastUtils.ts              # Toast utility functions
│       ├── 📄 form-hooks.ts       # Form hook utilities
│       └── 📄 sidebar-hooks.ts    # Sidebar hook utilities
│
├── 📁 hooks/                      # Global and integration hooks
│   ├── 📄 use-toast.ts            # Toast notification hook
│   ├── 📄 use-mobile.tsx          # Mobile detection hook
│   └── 📁 integration/            # Cross-feature integration hooks
│       ├── 📄 useAuthIntegration.ts          # Auth integration patterns
│       ├── 📄 useAuthUser.ts                 # Auth user integration
│       ├── 📄 useTravelPlanningIntegration.ts # Travel planning integration
│       ├── 📄 useTravelPreferencesIntegration.ts # Preferences integration
│       ├── 📄 useUserDataIntegration.ts      # User data integration
│       └── 📄 useUserProfileIntegration.ts   # Profile integration
│
├── 📁 store/                      # State management (Redux)
│   ├── 📄 storeApi.ts             # Public store API boundary
│   ├── 📁 slices/                 # Redux slices
│   │   └── 📄 authSlice.ts        # Authentication state slice
│   └── 📁 hooks/                  # Redux hooks
│       ├── 📄 reduxHooksApi.ts    # Redux hooks API
│       └── 📄 useReduxHooks.ts    # Custom Redux hooks
│
├── 📁 lib/                        # Shared libraries and utilities
│   ├── 📄 utils.ts                # General utility functions
│   ├── 📄 serviceUtils.ts         # Enterprise service utilities
│   └── 📁 supabase/               # Supabase configuration
│       └── 📄 client.ts           # Supabase client setup
│
├── 📁 utils/                      # General utility functions
│   ├── 📄 dateUtils.ts            # Date manipulation utilities
│   ├── 📄 formatUtils.ts          # Formatting utilities
│   └── 📄 ScrollToTop.tsx         # Scroll to top component
│
├── 📁 constants/                  # Global constants
│   └── 📄 appConstants.ts         # Application constants
│
└── 📁 types/                      # Global type definitions
    └── 📄 typesApi.ts             # Public types API boundary
```

### 🗄️ **Database & Backend (`supabase/`)**

```
supabase/
├── 📁 migrations/                 # Database schema migrations
│   ├── 📄 20250611195301_main_schema.sql           # Core database schema
│   ├── 📄 20250611195302_rbac_schema.sql           # Role-based access control
│   ├── 📄 20250611195303_chat_tables.sql           # Chat functionality tables
│   ├── 📄 20250611195304_account_deletion_schema.sql # Account deletion system
│   ├── 📄 20250613120000_admin_editor_rls_policies.sql # RLS policies
│   ├── 📄 20250613140000_subscription_schema.sql   # Subscription system
│   ├── 📄 20250613150000_subscription_rls_policies.sql # Subscription RLS
│   ├── 📄 20250613160000_beta_tester_program.sql   # Beta tester features
│   ├── 📄 20250614000000_update_travel_preferences_schema.sql # Travel prefs
│   └── 📄 20250615000000_simplify_auth_system.sql  # Simplified auth system
│
├── 📁 functions/                  # Edge Functions (Serverless)
│   ├── 📄 deno.json               # Deno configuration
│   ├── 📄 import_map.json         # Import map for dependencies
│   ├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 .lintstagedrc.json          # Lint-staged configuration for pre-commit hooks
├── 📄 SUPABASE_AUTH_SECURITY_GUIDE.md # Security guide for authentication setup
├── 📄 NEXTJS_MIGRATION_GUIDE.md   # Migration guide from Next.js to Vite
├── 📁 functions/                  # Edge function middleware
│   └── 📄 _middleware.ts          # CORS and routing middleware for edge functions│   ├── 📁 _shared/                # Shared utilities
│   │   └── 📄 cors.ts             # CORS headers configuration
│   ├── 📁 account-management/     # Account management functions
│   │   └── 📄 index.ts            # Account deletion and OAuth unlinking
│   ├── 📁 scheduled-account-deleter/ # Automated account cleanup
│   │   └── 📄 index.ts            # Scheduled deletion job
│   ├── 📁 create-checkout-session/ # Stripe checkout integration
│   │   └── 📄 index.ts            # Stripe session creation
│   └── 📁 stripe-webhook-handler/ # Stripe webhook processing
│       └── 📄 index.ts            # Subscription management via webhooks
│
└── 📄 import_map.json             # Global import map
```

### 🛠️ **Configuration & Tools (`config/`)**

```
config/
├── 📁 linting/                    # Code quality configuration
│   └── 📁 eslint/                 # ESLint configuration
│       ├── 📄 eslint.config.js    # Main ESLint configuration
│       ├── 📄 index.js            # ESLint exports
│       └── 📁 rules/              # Custom ESLint rules
│           └── 📄 enforce-architecture.js # Architecture enforcement rules
├── 📁 plop/                       # Code generation templates
│   ├── 📄 plopfile.js             # Plop configuration
│   ├── 📄 ai-feature.hbs          # AI feature template
│   ├── 📄 api-client.hbs          # API client template
│   ├── 📄 component.hbs           # Component template
│   ├── 📄 feature-api.hbs         # Feature API template
│   ├── 📄 feature-types.hbs       # Feature types template
│   ├── 📄 hook.hbs                # Hook template
│   ├── 📄 integration-hook.hbs    # Integration hook template
│   └── 📄 service.hbs             # Service template
├── 📁 dependencies/               # Dependency management
│   └── 📁 reports/                # Dependency reports
└── 📁 deployment/                 # Deployment configuration
    └── 📄 check-secrets.sh        # Security secrets checker
```

### 📜 **Build & Validation Scripts (`scripts/`)**

```
scripts/
├── 📄 architecture-validator.js   # Architecture compliance validation
├── 📄 architecture-change-control.js # Architecture change tracking
├── 📄 generate-architecture-diagram.js # Architecture visualization
└── 📄 generate-types.ts           # Type generation utilities
```

### 📚 **Documentation (`docs/`)**

```
docs/
├── 📄 ARCHITECTURE.md             # This comprehensive architecture guide
├── 📁 database/                   # Database documentation
│   └── 📄 DATABASE.md             # Database schema and patterns
├── 📁 developer/                  # Developer guides
│   └── 📄 guide.md                # Development workflows and best practices
└── 📁 setup/                      # Setup and configuration guides
    ├── 📄 configuration-guide.md  # Environment configuration
    ├── 📄 deployment-guide.md     # Deployment instructions
    ├── 📄 email-verification.md   # Email verification setup
    └── 📄 supabase-setup.md       # Supabase configuration guide
```

### 🌐 **Static Assets (`public/`)**

```
public/
├── 📄 _headers                    # HTTP headers configuration
├── 📄 robots.txt                 # Search engine directives
├── 📄 favicon.ico                # Browser favicon
├── 📄 favicon.svg                # SVG favicon
├── 📄 placeholder.svg            # Placeholder image
├── 📄 mesh-gradient.png          # Background gradient
├── 📄 earth-blue-marble.jpg      # Earth texture (blue marble)
├── 📄 earth-texture.jpg          # Earth surface texture
├── 📄 earth-topology.jpg         # Earth topological map
└── 📄 test.html                  # Test HTML file
```

## Core Architectural Principles

### 1. Feature-First Organization
Every feature is self-contained with its own components, services, hooks, and types. Features communicate only through their public API boundaries (`featureNameApi.ts`).

### 2. Enhanced Component System
- **Atomic Design**: atoms → molecules → organisms hierarchy
- **Enhanced Components**: Custom wrappers around ShadCN components with Planora-specific styling
- **Standardized Imports**: All components use enhanced versions for consistency

### 3. Service Layer Architecture
Enterprise-grade service layer with:
- **Retry Logic**: Exponential backoff with jitter
- **Monitoring**: Performance tracking and error reporting
- **Error Handling**: Graceful degradation and proper error boundaries

### 4. Type Safety & Quality
- **Zero TypeScript errors**: Strict mode compliance
- **No `any` types**: Proper type definitions throughout
- **Architectural validation**: Custom ESLint rules enforce patterns

## Feature Architecture

### Authentication System
**Simplified & Secure**: Standard Supabase patterns with email confirmation
- **OAuth Integration**: Google authentication with profile sync
- **Session Management**: Secure session handling with proper cleanup
- **Email Verification**: Streamlined email confirmation flow
- **Profile Integration**: Seamless integration with user profiles

### Subscription System
**Stripe Integration**: Three-tier subscription model
- **Explorer**: Basic tier for casual travelers
- **Wanderer Pro**: Advanced features for frequent travelers  
- **Global Elite**: Premium tier with all features
- **Automatic Tier Assignment**: Via Stripe webhooks

### Travel Planning
**AI-Powered**: Intelligent trip planning with preferences
- **Smart Recommendations**: AI-driven destination suggestions
- **Preference Learning**: Adaptive recommendation engine
- **Trip Management**: Save, edit, and share travel plans

## UI Component System

### Enhanced Components (`src/ui/atoms/`)
Custom components that extend ShadCN with Planora-specific styling:
- **Button**: Adds gradient, glass, and glow variants
- **Card**: Enhanced with custom shadows and spacing
- **Input**: Improved focus states and validation styling
- **Badge**: Custom variants for different contexts

### Atomic Design Hierarchy
- **Atoms**: Fundamental building blocks (Button, Input, Label)
- **Molecules**: Simple combinations (FeatureCard, TripCard)
- **Organisms**: Complex sections (Navigation, Footer, Earth scenes)

## Service Layer Architecture

### Enterprise Patterns
All services implement production-ready patterns:
- **Retry Logic**: Exponential backoff with jitter for resilience
- **Monitoring**: Performance tracking and error reporting
- **Error Boundaries**: Graceful degradation strategies
- **Type Safety**: Comprehensive TypeScript coverage

### Service Structure
```typescript
export async function serviceOperation(): Promise<Result> {
  return withRetryAndMonitoring(
    async () => {
      // Operation implementation
    },
    {
      operationName: 'serviceOperation',
      maxRetries: 3,
      shouldRetry: (error) => isRetriableError(error)
    }
  );
}
```

## Database & Backend

### Supabase Integration
- **18 Database Migrations**: Complete schema evolution
- **4 Active Edge Functions**: Account management, scheduled tasks, Stripe integration
- **Comprehensive RLS**: Row-level security on all tables
- **Security Hardening**: Function search path fixes, proper authentication

### Edge Functions
1. **account-management**: Account deletion and OAuth unlinking
2. **scheduled-account-deleter**: Automated cleanup processes
3. **create-checkout-session**: Stripe checkout integration
4. **stripe-webhook-handler**: Subscription management

## Development Tools & Configuration

### Code Quality
- **ESLint**: Custom rules for architectural compliance
- **TypeScript**: Strict mode with zero errors
- **Prettier**: Consistent code formatting
- **Architecture Validator**: Automated compliance checking

### Code Generation
- **Plop.js**: Templates for features, components, services
- **Type Generation**: Automatic TypeScript type generation
- **Scaffolding**: Consistent code structure generation

## Quality Assurance

### Automated Validation
```bash
npm run validate-arch    # Architecture compliance
npm run lint            # Code quality
npm run type-check      # TypeScript validation
npm run build           # Production build
```

### Quality Metrics
- **✅ Zero linting errors**
- **✅ Zero TypeScript errors**
- **✅ 100% architectural compliance**
- **✅ Production-ready build**

---

## 🎯 **Quick Reference for Development**

### Adding New Features
1. Use `npm run scaffold:feature <name>` to generate structure
2. Implement following feature-first principles
3. Export through `featureNameApi.ts` boundary
4. Add integration hooks for cross-feature communication

### Component Development
1. Check existing atoms/molecules before creating new ones
2. Use enhanced components from `@/ui/atoms/` for consistency
3. Follow atomic design principles for organization
4. Maintain Fast Refresh compatibility

### Service Development
1. Use `withRetryAndMonitoring` wrapper for all operations
2. Implement proper error handling and retry logic
3. Add performance monitoring for critical operations
4. Follow enterprise service patterns

This architecture provides a solid foundation for scaling Planora.ai while maintaining code quality, performance, and developer experience.
