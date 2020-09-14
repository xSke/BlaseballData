module.exports = {
    purge: ["src/**/*.tsx", "src/**/*.html", "src/**/*.ts"],
    theme: {
        extend: {
        },
    },
    variants: {},
    plugins: [],
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    }
}