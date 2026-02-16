/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            "/api": {
                target: "https://api.boltz.exchange",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/tests/setup.ts",
        css: true,
        include: ["src/**/*.test.{ts,tsx}"],
        exclude: ["node_modules", "boltz-backend"],
    },
});
