import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PERFORMANCE: Vite Configuration for Optimal Lighthouse Scores
 * - Code splitting for lazy-loaded sections
 * - Optimized chunk sizes
 * - Asset compression and caching
 */
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
        // PERFORMANCE: Manual chunks for better caching
        manualChunks: {
          // Vendor chunks - cached separately
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-query": ["@tanstack/react-query"],
          // UI components in separate chunk
          "ui-components": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
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
