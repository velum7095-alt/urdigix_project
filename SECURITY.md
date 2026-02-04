# Security Hardening & Deployment Guide

## 🛡️ Security Enhancements Applied

We have implemented a "Backend Architect" level security overhaul for the URDIGIX Admin Panel.

### 1. Admin Panel Access Control
- **Secure Server**: Created a dedicated backend server (`server/secure-server.js`) using Node.js/Express.
- **Port Isolation**: Access is restricted to port **4545** (configurable).
- **IP Whitelisting**: Middleware added to strictly allow only authorized IPs (e.g., VPN or Office IP).
- **Security Headers**: Implemented `Helmet` for strict CSP, HSTS, and X-Frame-Options to prevent clickjacking and XSS.

### 2. Authentication & Authorization
- **Backdoor Removed**: Deleted hardcoded `DEV_MODE` credentials and bypass logic from `useAuth.tsx`.
- **Role-Based Access Control (RLS)**: Enforced strict Row Level Security policies at the database level (Supabase).
- **Session Security**: Sessions are managed via Supabase's secure JWT implementation with client-side checks backed by DB policies.

### 3. Database Security
- **Auditing**: Implemented an immutable `audit_logs` table.
- **Auto-Logging**: Triggers automatically record every `INSERT`, `UPDATE`, and `DELETE` on sensitive tables (`quotations`, `invoices`, `business_settings`) with the actor's ID and timestamp.
- **No Deletes**: Audit logs cannot be modified or deleted.

### 4. PDF Security
- **Client-Side Generation**: Switched to `jspdf` to generate PDFs entirely in the browser. This eliminates Server-Side Template Injection (SSTI) vectors and prevents file system access vulnerabilities on the server.

---

## 🚀 Deployment Instructions

### Method: Secure VPS / Dedicated Server

#### 1. Environment Setup
Create a `.env` file in the root directory (use `.env.example` as a template):

```env
ADMIN_PORT=4545
ADMIN_IP_WHITELIST=192.168.1.50,10.0.0.1  # Add your VPN/Office IPs here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
NODE_ENV=production
```

#### 2. Build the Application
Compile the TypeScript/React application for production:

```bash
npm run build
```

#### 3. Run the Secure Server
Start the hardened Node.js server. This server serves the static assets while enforcing rate limits, IP whitelisting, and security headers.

```bash
npm run start:secure
```

**Verification:**
- Access `http://localhost:4545/admin`.
- Try accessing from a non-whitelisted IP (if configured) -> Should receive `403 Forbidden`.
- Check Response Headers -> Should see `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`.

### 4. Database Migration
Run the SQL migration in your Supabase SQL Editor to enable Audit Logs and Harden RLS:
- File: `supabase/migrations/20260204_security_hardening.sql`

---

## 🔒 Best Practices Checklist

- [x] **Rate Limiting**: Active (100 req / 15 min per IP)
- [x] **CSP**: Active (Prevents loading malicious scripts)
- [x] **HSTS**: Active (Forces HTTPS)
- [x] **No Hardcoded Secrets**: All credentials moved to `.env` or Supabase
- [x] **Strict RLS**: DB policies ensure users can only access what they are allowed to
- [x] **Audit Trails**: All critical actions are logged

## ⚠️ Important Notes
- **Firewall**: Configure your VPS firewall (UFW/AWS Security Group) to **ONLY allow Inbound traffic on port 4545** from your VPN/Whitelist IPs. Block it from the public internet if possible.
- **HTTPS**: Use a reverse proxy (Nginx/Caddy) with SSL in front of port 4545 for production.
