# URDIGIX Multi-App Project

This repository is organized into three separate folders for independent deployment and configuration on Vercel:

1. **`frontend/`** - The public landing page and services client application.
2. **`admin/`** - The internal CRM and admin dashboard portal.
3. **`backend/`** - The serverless API functions and Supabase configuration.

## Project Structure

```
URDIGIX/ (root)
├── frontend/             # Frontend Vite project (Vite/React/TS/Tailwind)
│   ├── src/
│   ├── package.json      # Dependencies for frontend
│   └── vite.config.ts    # Server runs on port 8080
├── admin/                # Admin CRM Vite project (Vite/React/TS/Tailwind)
│   ├── src/
│   ├── package.json      # Dependencies for admin
│   └── vite.config.ts    # Server runs on port 8081
└── backend/              # Serverless API & database config
    ├── api/              # Serverless endpoints (e.g. invoices)
    ├── supabase/         # Migrations and configurations
    └── package.json      # Dependencies for serverless functions
```

## Getting Started

### 1. Frontend
Go to the `frontend/` directory, install dependencies, and run the development server:
```sh
cd frontend
npm install
npm run dev
```
The client website will be hosted locally at `http://localhost:8080/`.

### 2. Admin & CRM
Go to the `admin/` directory, install dependencies, and run the development server:
```sh
cd admin
npm install
npm run dev
```
The admin/CRM portal will be hosted locally at `http://localhost:8081/`.

### 3. Backend (APIs)
Dependencies for serverless functions can be installed inside the `backend/` directory:
```sh
cd backend
npm install
```

## Deployment on Vercel

To deploy on Vercel:
1. Create a Vercel project for the **Frontend**. Set the Root Directory to `frontend`.
2. Create a Vercel project for the **Admin Panel**. Set the Root Directory to `admin`.
3. If hosting serverless API routes separately, create a Vercel project for the **Backend** and set the Root Directory to `backend`.
