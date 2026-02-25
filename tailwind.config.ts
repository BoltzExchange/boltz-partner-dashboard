import type { Config } from "tailwindcss";

import { colors } from "./src/utils/colors";

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors,
            fontFamily: {
                sans: ['"Noto Sans"', "system-ui", "sans-serif"],
                mono: ['"Noto Mono"', "monospace"],
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out forwards",
                "slide-up": "slideUp 0.5s ease-out forwards",
                "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                pulseSubtle: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.7" },
                },
            },
            borderRadius: {
                sm: "8px",
                md: "12px",
                lg: "16px",
            },
        },
    },
    plugins: [],
} satisfies Config;
