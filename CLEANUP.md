# Cleanup Instructions

For a streamlined SaaS boilerplate with just authentication and a basic dashboard, the following files and directories can be safely removed:

## Directories to Remove:

1. `src/app/subscriptions` - Replaced with dashboard
2. `src/components/subscriptions` - Subscription-specific components
3. `src/lib/subscriptions` - Subscription business logic
4. `src/app/api/subscriptions` - Subscription API endpoints
5. `src/lib/services/__tests__` - Test files for subscription service
6. `src/models/__tests__/subscription.test.ts` - Subscription model tests
7. `src/types/subscription.ts` and `src/types/subscriptions.ts` - Subscription type definitions
8. `src/lib/validations/subscription.ts` - Subscription validation logic

## API Endpoints to Remove/Simplify:

1. `src/app/api/storage` - Storage API endpoint
2. `src/app/api/test-db*` - Various test DB endpoints
3. `src/app/api/test-user-creation` - Test user creation endpoint

## Files to Keep/Modify:

1. All authentication-related files in `src/lib/auth` and `src/app/auth`
2. The user model in `src/models/user.ts`
3. Database connection logic in `src/lib/db`
4. Basic UI components in `src/components/ui` and `src/components/common`
5. Layout components in `src/components/layout`

## Already Modified Files:

1. `src/app/page.tsx` - Updated to redirect to dashboard
2. `package.json` - Removed unnecessary dependencies
3. `README.md` - Updated documentation
4. `src/middleware.ts` - Added dashboard route to middleware
5. Added new `src/app/dashboard/page.tsx` for the welcome page

## Optional Cleanup:

1. Simplify the database connection logic if you don't need all the testing utilities
2. Remove complex error handling if basic error management is sufficient

After removing these files and directories, your project will be a focused, minimal SaaS boilerplate with authentication and a simple dashboard page ready for extension to your specific product requirements.
