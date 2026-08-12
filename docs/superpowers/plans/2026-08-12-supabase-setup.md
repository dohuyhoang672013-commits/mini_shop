# Supabase Integration Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Supabase dependencies and configure connection helpers, environment variables, and middleware for session management.

**Architecture:** Use `@supabase/ssr` to establish standard client, server, and middleware clients for session handling, integrated with Next.js App Router and Next.js middleware.

**Architecture Diagram:**

```mermaid
graph TD
    Client[Browser Client] --> |auth / data queries| Supabase[Supabase API]
    ServerComp[Server Components] --> |server client / cookies| Supabase
    Middleware[Next.js Middleware] --> |middleware client / refresh session| Supabase
```

**Tech Stack:**
- Next.js (16.3.0)
- React (19.2.8)
- `@supabase/supabase-js`
- `@supabase/ssr`

## Global Constraints
- Write helpers in JavaScript (`.js` files) to align with the existing project codebase.
- Ensure the database connection password is percent-encoded (`%3C`) in the PostgreSQL connection string.

---

### Task 1: Environment Configuration & Dependencies

**Files:**
- Modify: `mini-shop-next/package.json`
- Create: `mini-shop-next/.env.local`

**Interfaces:**
- Consumes: None
- Produces: Supabase environment variables and node packages.

- [ ] **Step 1: Install Supabase npm packages**

Run: `npm install @supabase/supabase-js @supabase/ssr` in `c:\Users\admin\Desktop\mini_shop\mini-shop-next`
Expected: Installs dependencies successfully.

- [ ] **Step 2: Create environment variables file**

Write to [mini-shop-next/.env.local](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://vvdmieppkecvpbmfphas.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_9epkR5D4fgummjS1pZSdag_67WGoMC0
DATABASE_URL=postgresql://postgres:%3Cdohuyhoang06072013@db.vvdmieppkecvpbmfphas.supabase.co:5432/postgres
```

- [ ] **Step 3: Commit environment variables and configuration**

Run:
```bash
git add package.json package-lock.json
git commit -m "chore: install Supabase dependencies"
```
*(Note: `.env.local` is gitignored by default, verify it is not committed)*

---

### Task 2: Supabase Connection Helpers

**Files:**
- Create: `mini-shop-next/utils/supabase/client.js`
- Create: `mini-shop-next/utils/supabase/server.js`
- Create: `mini-shop-next/utils/supabase/middleware.js`

**Interfaces:**
- Consumes: environment variables in `process.env`.
- Produces: `createClient` exported functions for browser, server components, and middleware contexts.

- [ ] **Step 1: Create the Browser Client helper**

Write to [mini-shop-next/utils/supabase/client.js](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/utils/supabase/client.js):
```javascript
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
```

- [ ] **Step 2: Create the Server Client helper**

Write to [mini-shop-next/utils/supabase/server.js](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/utils/supabase/server.js):
```javascript
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (cookieStore) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
```

- [ ] **Step 3: Create the Middleware Client helper**

Write to [mini-shop-next/utils/supabase/middleware.js](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/utils/supabase/middleware.js):
```javascript
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (request) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  return { supabase, supabaseResponse };
};
```

- [ ] **Step 4: Commit connection helpers**

Run:
```bash
git add utils/supabase/client.js utils/supabase/server.js utils/supabase/middleware.js
git commit -m "feat: add Supabase client, server, and middleware connection helpers"
```

---

### Task 3: Middleware Integration & Agent Skills

**Files:**
- Create: `mini-shop-next/middleware.js`

**Interfaces:**
- Consumes: `createClient` from `./utils/supabase/middleware`
- Produces: Handled cookie refreshes on all incoming requests.

- [ ] **Step 1: Create Next.js Middleware**

Write to [mini-shop-next/middleware.js](file:///c:/Users/admin/Desktop/mini_shop/mini-shop-next/middleware.js):
```javascript
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request) {
  const { supabase, supabaseResponse } = createClient(request);
  
  // Refresh session if needed
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 2: Install Supabase Agent Skills**

Run: `npx skills add supabase/agent-skills` in `c:\Users\admin\Desktop\mini_shop`
Expected: Installs developer helper skills.

- [ ] **Step 3: Verify the build**

Run: `npm run build` in `c:\Users\admin\Desktop\mini_shop\mini-shop-next`
Expected: Builds cleanly without syntax or bundling errors.

- [ ] **Step 4: Commit middleware**

Run:
```bash
git add middleware.js
git commit -m "feat: add Next.js session refresh middleware"
```
