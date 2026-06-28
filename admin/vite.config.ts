import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * PERFORMANCE: Vite Configuration for Optimal Lighthouse Scores
 * - Code splitting for lazy-loaded sections
 * - Optimized chunk sizes
 * - Asset compression and caching
 */
export default defineConfig(({ mode }) => ({
  base: process.env.CROSS_BUILD ? "/admin/" : "/",
  server: {
    host: "::",
    port: 8081,
    hmr: {
      overlay: true,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // PERFORMANCE: Target modern browsers for smaller bundles
    target: "esnext",
    // PERFORMANCE: Enable minification
    minify: "esbuild",
    // PERFORMANCE: Optimize CSS
    cssMinify: true,
    // PERFORMANCE: Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react/")) {
              return "vendor-react";
            }
            if (id.includes("react-router-dom")) {
              return "vendor-router";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            if (
              id.includes("@radix-ui/react-dialog") ||
              id.includes("@radix-ui/react-dropdown-menu") ||
              id.includes("@radix-ui/react-toast") ||
              id.includes("@radix-ui/react-tooltip")
            ) {
              return "ui-components";
            }
          }
        },
        // PERFORMANCE: Consistent chunk naming for better caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // PERFORMANCE: Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // PERFORMANCE: Source maps in production for debugging
    sourcemap: false,
  },
  // PERFORMANCE: Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "framer-motion"],
  },
  // COMPATIBILITY: Allow NEXT_PUBLIC_ variables (standard for Supabase/Vercel)
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
}));
