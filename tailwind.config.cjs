/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["InterVariable", "Inter"],
            },
            colors: {
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
            },
            textColor: {
                default: "var(--color-text)",
                offset: "var(--color-text-offset)",
            },
            backgroundColor: {
                default: "var(--color-background)",
                offset: "var(--color-background-offset)",
            },
            borderColor: {
                default: "var(--color-border)",
            },
        },
    },
    corePlugins: {
        fontSize: false,
    },
    plugins: [require("tailwindcss-fluid-type")],
    darkMode: ["class", ".darkmode"],
};
