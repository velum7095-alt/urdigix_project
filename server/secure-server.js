const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.ADMIN_PORT || 4545;
const HOST = process.env.ADMIN_HOST || '0.0.0.0'; // Change to '127.0.0.1' to bind only to localhost

// ==========================================
// 1. SECURITY HEADERS (Helmet)
// ==========================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://*.supabase.co"], // Supabase requires this
            connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"], // Supabase sockets
            imgSrc: ["'self'", "data:", "https://*.supabase.co"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Styled components/Tailwind often need this
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false, // Often causes issues with external resources
}));

// ==========================================
// 2. IP WHITELISTING (Middleware)
// ==========================================
const WHITELISTED_IPS = (process.env.ADMIN_IP_WHITELIST || '').split(',').filter(Boolean);

const ipWhitelistMiddleware = (req, res, next) => {
    // If no whitelist is defined, allow all (or default to stricter policy if desired)
    if (WHITELISTED_IPS.length === 0) return next();

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Basic check - in production use a robust IP matching library for CIDR support
    const isAllowed = WHITELISTED_IPS.some(ip => clientIp.includes(ip));

    if (!isAllowed) {
        console.warn(`[BLOCKED] Access attempt from unauthorized IP: ${clientIp}`);
        return res.status(403).send('Forbidden: Unauthorized Access');
    }
    next();
};

if (WHITELISTED_IPS.length > 0) {
    app.use(ipWhitelistMiddleware);
    console.log(`🔒 IP Whitelist Active: ${WHITELISTED_IPS.join(', ')}`);
}

// ==========================================
// 3. RATE LIMITING
// ==========================================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// ==========================================
// 4. GENERAL MIDDLEWARE
// ==========================================
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Limit body size

// ==========================================
// 5. STATIC FILES SERVING (Production Build)
// ==========================================
// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, '../dist'), {
    index: false, // Ensure we handle the index route manually for SPA
    maxAge: '1y', // Cache static assets
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache'); // Don't cache HTML
        }
    }
}));

// ==========================================
// 6. SPA FALLBACK & ADMIN PROTECTION
// ==========================================
app.get('*', (req, res) => {
    // OPTIONAL: Server-side check if user accesses /admin route
    // Note: We can't validate Supabase session easily here without an auth cookie
    // But we did the IP whitelist above.

    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ==========================================
// 7. START SERVER
// ==========================================
app.listen(PORT, HOST, () => {
    console.log(`
    =======================================================
    🛡️  SECURE ADMIN SERVER STARTED
    =======================================================
    URL: http://${HOST}:${PORT}
    ENV: ${process.env.NODE_ENV || 'development'}
    PORT: ${PORT}
    
    Security Controls:
    ✅ Helmet Headers: Active
    ✅ Rate Limiting: Active (100 req/15min)
    ✅ IP Whitelist: ${WHITELISTED_IPS.length > 0 ? 'Active' : 'Disabled (Allow All)'}
    
    Make sure to configure firewall rules to ONLY expose port ${PORT}
    to your private network or VPN IP.
    =======================================================
    `);
});
