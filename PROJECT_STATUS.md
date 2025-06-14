# Project Health & Feature Checklist

Here is a point-by-point analysis of each requirement, its current implementation state, and the identified gaps.

---

### 1. Authentication & Registration

| Status | Feature | Requirement | Current State & Analysis | Gap / Missing Logic |
| :--- | :--- | :--- | :--- | :--- |
| ✅ **Done** | **Google Sign-In** | User signs in, email is auto-verified, proceeds to onboarding, data is stored. | The flow is implemented. `googleAuthHelper.ts` and `supabaseAuthService.ts` handle the OAuth callback and profile creation. The user is correctly redirected to the `/onboarding` route. | None. This appears to be working as intended. |
| 🟡 **Partially Done** | **Email/Password Registration** | Form with Country/City, summary page, verification code, account created **only after** verification. | We have a two-phase registration (`initiateSignup`, `completeSignup`) using a verification code, which is correct. The `Register.tsx` page exists. | **1. UI:** The registration form in `Register.tsx` is basic and **lacks the dynamic Country/City fields**. **2. Summary Page:** There is **no summary page** shown after initial form submission. **3. Account Creation Timing:** This is the most critical gap. The `initiate-signup` function likely creates an entry in `auth.users` immediately. Your requirement is that the user is not created until the code is verified. We need to confirm and likely change this. **The user should not exist in the system at all until verification is complete.** |

---

### 2. Onboarding Logic

| Status | Feature | Requirement | Current State & Analysis | Gap / Missing Logic |
| :--- | :--- | :--- | :--- | :--- |
| ❌ **Missing** | **Conditional Location Logic** | Different logic for handling departure location based on whether the user registered via form or Google. | This logic is entirely missing. The `Onboarding.tsx` component and related services (`userProfileService.ts`, `travelPreferencesService.ts`) do not contain any conditional logic to distinguish between a Google-authenticated user and a form-registered user for pre-filling or linking locations. | We need to implement the full conditional workflow: <br> • **Detect auth method.** <br> • **Onboarding:** Pre-fill location for form users; require manual entry for Google users. <br> • **Profile Updates:** Create the specific linking behavior where `user_location` updates `departure_location` but not necessarily the other way around. |

---

### 3. Email, Password, & Account Logic

| Status | Feature | Requirement | Current State & Analysis | Gap / Missing Logic |
| :--- | :--- | :--- | :--- | :--- |
| 🟡 **Partially Done** | **Change Email** | Requires a secure confirmation link to be clicked before the change is finalized. | The `updateEmail` function exists in `supabaseAuthService.ts`, but it's a direct update. It **does not implement the required two-step "secure link" confirmation process**. | The entire secure flow needs to be built: <br> 1. User requests change in UI. <br> 2. Backend sends a verification email to the *new* address. <br> 3. User clicks the link. <br> 4. A handler verifies the token and finalizes the email change in the database. |
| 🟡 **Partially Done** | **Reset/Change Password** | Reset requires a link. Change requires the current password and a confirmation link. | `sendPasswordResetEmail` and `resetPassword` functions exist and likely follow Supabase's standard (and secure) flow. However, the "Change Password" flow is **missing the email confirmation link step**. | We need to add the email confirmation step to the "Change Password" flow for enhanced security. |
| ❌ **Missing** | **Delete Account** | `DELETE` keyword modal -> secure email link -> soft delete -> 30-day reactivation link. | The `deleteUserProfile` function in `userProfileService.ts` performs a hard delete via Supabase. **None of the required safety features (modal, email link, soft delete, reactivation) are implemented.** | This is a significant feature to build: <br> 1. UI modal with keyword confirmation. <br> 2. Backend logic to trigger a confirmation email. <br> 3. A handler for the email link that performs a "soft delete" (e.g., sets `account_status` to `pending_deletion` and sets a `deleted_at` timestamp). <br> 4. A separate mechanism/endpoint for reactivation. <br> 5. A scheduled task (e.g., a cron job) to perform the hard delete after 30 days. |
| ❌ **Missing** | **Google User Email Change** | Must set a password first, which unlinks Google Auth and converts the account to email/password. | This entire workflow is missing. There is no logic to detect this specific scenario or guide the user through creating a password and unlinking their Google account. | A new UI flow and backend logic are needed to handle this conversion process gracefully and securely. |

---

### 4. Roles & Access Levels

| Status | Feature | Requirement | Current State & Analysis | Gap / Missing Logic |
| :--- | :--- | :--- | :--- | :--- |
| 🟡 **Partially Done** | **Role Management** | Admin & Tester roles. Admin can bypass auth. | We have an `is_beta_tester` boolean flag in the `profiles` table and a basic `/admin` page. This serves the "Tester" role. The concept of an "Admin" role exists but is not fully fleshed out. | **1. Admin Privileges:** The critical "bypass authentication" capability for Admins is **missing** and would require significant work with Supabase RLS and custom logic. **2. Role System:** We are using a simple boolean flag. A more robust solution would be a dedicated `roles` table or an enum field in the `profiles` table to support future roles. |

---

### 5. Subscription Model

| Status | Feature | Requirement | Current State & Analysis | Gap / Missing Logic |
| :--- | :--- | :--- | :--- | :--- |
| ❌ **Not Started** | **Subscription Tiers** | Free, Middle, Premium tiers managed via Stripe. | We have a placeholder `subscriptionService.ts`. You've mentioned the API keys are available. However, **no actual implementation exists**. | This is a major epic. We need to: <br> 1. Design the database schema for subscriptions. <br> 2. Implement Stripe Checkout for plan upgrades. <br> 3. Create a Stripe webhook handler to listen for successful payments and update the user's tier in our database. <br> 4. Implement logic throughout the app to check the user's subscription tier and unlock/restrict features accordingly. |

---

### 6. Future Features

| Status | Feature | Requirement | Current State & Analysis |
| :--- | :--- | :--- | :--- |
| 🚀 **Future Task** | **Nearby Airports** | Extend onboarding to suggest nearby airports based on user's location. | As you stated, this is a future task. It is not part of the current implementation phase. |

---

### Summary & Proposed Action Plan

Your vision is clear, and we have a solid foundation, but there are significant gaps between the current implementation and the required functionality.

| Category | Status |
| :--- | :--- |
| **Core Architecture** | ✅ **Done** |
| **Google Authentication** | ✅ **Done** |
| **Email Registration** | 🟡 **Partially Done** |
| **Account Management** | ❌ **Mostly Missing** |
| **Onboarding Logic** | ❌ **Missing** |
| **Role Management** | 🟡 **Partially Done** |
| **Subscriptions** | ❌ **Not Started** |

Based on this analysis, I propose the following prioritized action plan:

1.  **Solidify What We Have (The "Cleanup" Phase):**
    *   **Task 1: Fix All Linter Errors.** Before adding new code, let's make the codebase pristine so the `pre-commit` hook passes cleanly. This prevents technical debt.
    *   **Task 2: Complete Email Registration Flow.** Address the gaps identified above: add the Country/City form fields, the summary page, and, most importantly, modify the backend logic to ensure the user account is **only** created after the email code is successfully verified.

2.  **Implement Critical Account Management:**
    *   **Task 3: Build Secure Account Deletion.** The current hard-delete is dangerous. Implementing the full soft-delete with email confirmation and reactivation is a critical user-safety feature.
    *   **Task 4: Build Secure Email Change.** Implement the two-step secure link confirmation for changing an email address.

3.  **Implement Core Application Logic:**
    *   **Task 5: Implement Conditional Onboarding Logic.** Build the complex stateful logic for handling user and departure locations based on the registration method.

Once these foundational pieces are in place and working perfectly, we can then move on to the larger epics like the **Subscription Model**. 