module.exports = {
    content: [
        './src/**/*.{html,ts}',
    ],
    // Evita que Tailwind resetee los estilos base de Ionic
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {},
    },
    plugins: [],
}