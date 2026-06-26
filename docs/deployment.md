# URDIGIX Deployment

This project deploys as one Vercel app with three separated areas:

- Public frontend: `/`, `/start-project`, `/poster-design`, and policy pages.
- Admin CRM: `/auth` and `/admin`, protected by Supabase Auth and admin role checks.
- Backend API: `/api/*`, implemented as Vercel serverless functions.

## Vercel Project Settings

Use these settings when importing the GitHub repository into Vercel:

```txt
Framework Preset: Vite
Root Directory: ./
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

The `vercel.json` file keeps `/api/*` away from the frontend SPA rewrite and adds no-index/no-store headers for admin routes.

## Environment Variables

Add these in Vercel under Project Settings -> Environment Variables:

```txt
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Only `VITE_*` values are exposed to the browser. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must be used only by files in `api/`.

## Admin Access

The CRM is available at:

```txt
https://your-domain.com/admin
```

Login is available at:

```txt
https://your-domain.com/auth
```

After creating a Supabase Auth user, grant admin access from the Supabase SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT DO NOTHING;
```

## Domain Setup

In Vercel:

1. Open the URDIGIX project.
2. Go to Settings -> Domains.
3. Add the root domain, for example `urdigix.com`.
4. Add the `www` domain, for example `www.urdigix.com`.
5. Follow Vercel's DNS instructions at your domain registrar.
6. Use one canonical domain and redirect the other to it in Vercel.

Recommended production URLs:

```txt
Frontend: https://urdigix.com
Admin CRM: https://urdigix.com/admin
Backend API: https://urdigix.com/api/invoices
```

If Vercel shows a canceled status on GitHub, open the deployment in Vercel and redeploy it. A canceled deployment status is emitted by Vercel and is not caused by Git push itself.
