# Supabase Integration Design Spec

Date: 2026-08-12
Topic: Supabase Integration & Connection Setup

## Goal Description
Configure the connection helpers, environment variables, middleware, and database connection strings to integrate Supabase into the Next.js `mini-shop-next` application.

## User Review Required
> [!IMPORTANT]
> The database password provided contains a special character `<`. In the PostgreSQL connection string, it is percent-encoded as `%3C` to avoid parsing errors.

## Proposed Changes

### Configuration files
#### [NEW] [docs/superpowers/specs/2026-08-12-supabase-setup-design.md](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/docs/superpowers/specs/2026-08-12-supabase-setup-design.md)
* The design document itself.

#### [NEW] [mini-shop-next/.env.local](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/.env.local)
* Store `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `DATABASE_URL` (percent-encoded).

### Supabase Connection Helpers (JavaScript)
We are placing the connection files inside `mini-shop-next/utils/supabase/` using standard JavaScript, matching the existing structure of the Next.js project.

#### [NEW] [mini-shop-next/utils/supabase/client.js](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/utils/supabase/client.js)
* Creates a Supabase browser client.

#### [NEW] [mini-shop-next/utils/supabase/server.js](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/utils/supabase/server.js)
* Creates a Supabase server client that handles cookie management for Next.js Server Components.

#### [NEW] [mini-shop-next/utils/supabase/middleware.js](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/utils/supabase/middleware.js)
* Creates a Supabase server client for use in Next.js Middleware to read and update session cookies.

### Next.js Middleware Routing
#### [NEW] [mini-shop-next/middleware.js](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/middleware.js)
* Middleware entry point that calls the Supabase middleware helper to automatically keep user sessions active across page navigations.

## Verification Plan
### Manual Verification
1. Run `npm install` inside the project to verify dependencies install cleanly.
2. Run `npm run build` to ensure the new JavaScript helpers and middleware compile without any syntax or bundler errors.
