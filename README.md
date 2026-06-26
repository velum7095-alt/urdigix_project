# URDIGIX

URDIGIX is a Vite, React, TypeScript, and Tailwind CSS website with admin and CRM-style workspace features.

## Getting Started

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Project Areas

- Public frontend routes are served by the Vite app.
- Admin CRM routes live at `/auth` and `/admin`.
- Backend API routes live under `/api/*` and run as Vercel serverless functions.

See [Deployment](docs/deployment.md) for Vercel, domain, environment variable, and admin access setup.

## Scripts

- `npm run dev` starts the local Vite development server.
- `npm run build` creates the production build in `dist`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.
- `npm run test` runs the Vitest test suite.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel
