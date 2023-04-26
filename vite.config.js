/** @type {import('vite').UserConfig} */
export default {
    root: "./src",
    publicDir: "../assets",
    build: {
        outDir: "../dist"
    },
    plugins: [
        {
            name: "config-cors",
            configureServer: (server) => {
                server.middlewares.use((req, res, next) => {
                    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                    next();
                });
            }
        },
    ],

}