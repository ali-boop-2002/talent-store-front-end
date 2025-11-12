# Deployment Guide

## Environment Variables

This project uses environment variables to configure the backend API URL. Follow these steps to deploy:

### 1. Local Development

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

This is already configured in `/lib/config.ts` as a fallback.

### 2. Production Deployment (Vercel)

Add the following environment variable in your Vercel project settings:

```
NEXT_PUBLIC_API_URL=https://talent-store-backend.onrender.com
```

### Steps to Set Up on Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Name: `NEXT_PUBLIC_API_URL`
5. Value: `https://talent-store-backend.onrender.com`
6. Redeploy your project

### Accessing the Environment Variable

All API calls now use the centralized config:

```typescript
import { API_URL } from "@/lib/config";

// Use in fetch calls
const response = await fetch(`${API_URL}/api/endpoint`);
```

## Files Modified

The following files were updated to use `${API_URL}` instead of hardcoded `http://localhost:3000`:

- `lib/useAuth.ts`
- `lib/socket.ts`
- `lib/api/applicationApi.ts`
- `app/page.tsx`
- `app/find-talent/page.tsx`
- `app/find-gigs/[id]/page.tsx`
- `app/find-gigs/page.tsx`
- `app/postjob/page.tsx`
- `app/profile/[slug]/page.tsx`
- `app/contracts/page.tsx`
- `app/contracts/create/[id]/page.tsx`
- `app/contracts/create/page.tsx`
- `app/transactions/page.tsx`
- `app/manage-jobs/page.tsx`
- `app/manage-jobs/view-applicants/[id]/page.tsx`
- `app/applied-jobs/page.tsx`
- `app/profile/userProfile/add-gig/page.tsx`
- `app/profile/userProfile/settings/page.tsx`
- `app/profile/userProfile/view-gigs/page.tsx`
- `app/get-keys/page.tsx`
- `app/chat/[id]/page.tsx`
- `app/chat/layout.tsx`
- `components/Application.tsx`
- `components/clientRatings.tsx`
- `components/rating.tsx`
- `components/SelectBar.tsx`
- `components/Navbar.tsx`
- `components/Contacts.tsx`
- `components/KeyPaymentForm.tsx`
- `components/KeyPaymentForSubscription.tsx`
- `components/UserProfileForm.tsx`

## Config File

The new centralized configuration file is at `/lib/config.ts`:

```typescript
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
```

This ensures:

- In production (Vercel), it uses the environment variable
- In development, it falls back to localhost:3000
- The `NEXT_PUBLIC_` prefix makes it available in the browser
