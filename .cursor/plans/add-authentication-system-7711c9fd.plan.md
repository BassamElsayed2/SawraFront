<!-- 7711c9fd-d367-45a0-9dd2-7e2479ed0f69 c52d67d3-751e-40aa-8983-ffa74a3b1ff2 -->
# Add Authentication System with Supabase

## 1. Setup Supabase Auth Configuration

### Update Supabase Client

- Upgrade `services/supabase.ts` to support both client-side and server-side authentication
- Create separate clients:
  - `supabase.ts` - client-side with `createBrowserClient`
  - `supabase-server.ts` - server-side with `createServerClient` for cookies handling
  - `supabase-middleware.ts` - middleware client for auth checks

### Install Required Packages

```bash
npm install @supabase/ssr @react-google-maps/api
```

- `@supabase/ssr` - for Supabase server-side auth
- `@react-google-maps/api` - for Google Maps integration (free tier)

## 2. Database Schema (Supabase)

Create tables in Supabase:

- `profiles` table:
  - id (uuid, references auth.users)
  - full_name (text)
  - phone (text)
  - created_at (timestamp)
  - updated_at (timestamp)

- `addresses` table:
  - id (uuid, primary key)
  - user_id (uuid, references profiles)
  - title (text) - e.g., "Home", "Work"
  - street (text)
  - building (text)
  - floor (text)
  - apartment (text)
  - city (text)
  - area (text)
  - latitude (double precision) - for Google Maps
  - longitude (double precision) - for Google Maps
  - notes (text)
  - is_default (boolean)
  - created_at (timestamp)

## 3. Auth Context & Hooks

### Create Auth Context

- `contexts/auth-context.tsx`:
  - Manage user session state
  - Provide sign-in, sign-up, sign-out functions
  - Handle user profile data
  - Listen to auth state changes

### Create Auth Hook

- `hooks/use-auth.ts` - easy access to auth context

## 4. Auth Pages & Components

### Sign In Page

- `app/[lang]/auth/signin/page.tsx`:
  - Email/password form with validation (react-hook-form + zod)
  - Error handling with toast notifications
  - Link to sign-up page
  - Link to forgot password page
  - Redirect to profile or previous page after login

### Sign Up Page

- `app/[lang]/auth/signup/page.tsx`:
  - Registration form (email, password, full name, phone)
  - Form validation
  - Auto sign-in after successful registration
  - Create profile record in database

### Forgot Password Flow

- `app/[lang]/auth/forgot-password/page.tsx`:
  - Email input form
  - Send password reset email via Supabase
  - Success message with instructions

- `app/[lang]/auth/reset-password/page.tsx`:
  - New password form
  - Validate reset token from email link
  - Update password and redirect to sign-in

### Auth Components

- `components/auth/signin-form.tsx` - reusable sign-in form
- `components/auth/signup-form.tsx` - reusable sign-up form
- `components/auth/forgot-password-form.tsx` - password reset request form
- `components/auth/reset-password-form.tsx` - new password form
- `components/auth/user-menu.tsx` - dropdown menu in navbar with user info and logout

## 5. Profile Page

### Main Profile Page

- `app/[lang]/profile/page.tsx`:
  - Protected route (requires authentication)
  - Display user information
  - Tabs for: Personal Info, Addresses, Order History (placeholder for future)

### Addresses Management

- `app/[lang]/profile/addresses/page.tsx`:
  - List all user addresses
  - Add new address form
  - Edit existing addresses
  - Delete addresses
  - Set default address

### Components

- `components/profile/address-card.tsx` - display single address with map preview
- `components/profile/address-form.tsx` - add/edit address form with Google Maps picker
- `components/profile/address-map-picker.tsx` - interactive Google Maps location selector with:
  - Draggable marker for location selection
  - "Auto-fill from map" button using Google Geocoding API
  - Automatically populate street, city, area fields from selected location
- `components/profile/profile-info.tsx` - display and edit user info

## 6. API Services

### Auth Service

- `services/apiAuth.ts`:
  - signIn(email, password)
  - signUp(email, password, userData)
  - signOut()
  - getCurrentUser()
  - updateProfile(data)

### Addresses Service

- `services/apiAddresses.ts`:
  - getAddresses(userId)
  - addAddress(userId, addressData)
  - updateAddress(addressId, data)
  - deleteAddress(addressId)
  - setDefaultAddress(addressId)

### Delivery Service

- `services/apiDelivery.ts`:
  - calculateDeliveryFee(userLat, userLng) - calculate based on distance from nearest branch
  - getNearestBranch(userLat, userLng) - find closest branch
  - getDistanceFromBranch(branchId, userLat, userLng) - calculate distance in km

## 7. Middleware Protection

### Update Middleware

- Extend `middleware.ts`:
  - Add auth session checking
  - Protect `/profile` routes
  - Redirect unauthenticated users to sign-in
  - Maintain locale handling

## 8. Navigation Updates

### Update Navbar

- Modify `components/navbarOne.tsx` and `components/navBarTwo.tsx`:
  - Add user menu when authenticated
  - Show sign-in button when not authenticated
  - Display user avatar/name

## 9. Internationalization

### Update Dictionaries

- Add to `app/[lang]/dictionaries/ar.json`:
  - Auth translations (sign in, sign up, profile, addresses, etc.)
- Add to `app/[lang]/dictionaries/en.json`:
  - English translations

## 10. Integration with Cart

### Connect Auth to Cart

- Update `contexts/cart-context.tsx`:
  - Save cart to user's account when logged in
  - Sync cart across devices
  - Prepare for checkout with user addresses

## Key Files to Create/Modify

**New Files:**

- `services/supabase-server.ts`
- `services/supabase-middleware.ts`
- `services/apiAuth.ts`
- `services/apiAddresses.ts`
- `contexts/auth-context.tsx`
- `hooks/use-auth.ts`
- `app/[lang]/auth/signin/page.tsx`
- `app/[lang]/auth/signup/page.tsx`
- `app/[lang]/profile/page.tsx`
- `app/[lang]/profile/addresses/page.tsx`
- `components/auth/signin-form.tsx`
- `components/auth/signup-form.tsx`
- `components/auth/user-menu.tsx`
- `components/profile/address-card.tsx`
- `components/profile/address-form.tsx`
- `components/profile/profile-info.tsx`

**Modified Files:**

- `services/supabase.ts`
- `middleware.ts`
- `components/navbarOne.tsx`
- `components/navBarTwo.tsx`
- `app/[lang]/dictionaries/ar.json`
- `app/[lang]/dictionaries/en.json`
- `contexts/cart-context.tsx`
- `components/providers.tsx`
- `package.json`

### To-dos

- [ ] Install @supabase/ssr and create server/middleware Supabase clients
- [ ] Create auth context and hooks for managing user session
- [ ] Create API services for authentication and addresses management
- [ ] Build sign-in and sign-up pages with forms and validation
- [ ] Create profile page with user info display
- [ ] Build addresses management page with CRUD operations
- [ ] Update navbar with user menu and auth buttons
- [ ] Update middleware to protect profile routes
- [ ] Add auth-related translations to Arabic and English dictionaries
- [ ] Integrate auth with cart context for user-specific carts