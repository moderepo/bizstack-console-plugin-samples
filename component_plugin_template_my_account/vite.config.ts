import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: 'http://localhost:5001/',
    server: {
        port: 5001,

        // CORS settings for DEV mode doesn't work sometimes.
        // If the following config doesn't work, developers can disable the browser's flag "chrome://flags/#local-network-access-check"
        origin: 'http://localhost:5001',
        cors: true,
        headers: {
            'Access-Control-Allow-Origin': '*', // Or the host's specific URL
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        },
        hmr: false, // Disables HMR entirely to fix the preamble error
    },
    preview: {
        port: 5001,
        cors: true,
    },
    plugins: [
        react(),
        federation({
            name: 'My Account Components',

            // The build script will build the project and create an entry file. This filename tells the build script to name the
            // entry file with this name
            filename: 'myAccountComponents.js',

            // Modules to expose
            exposes: {
                './myAccountComponents': './src/my-account-components',
            },

            // Specify which library is shared. BizConsole will not load these library from the plugin and use the one installed internally instead.
            shared: [
                'react',
                'react-dom',
                'react-router',
                'react-router-dom',
                '@mui/material',
                'zustand',
                '@moderepo/bizstack-console-sdk',
                'i18next',
                'react-i18next',
                // The following is required only when you want to implement a component that uses Google Maps.
                '@vis.gl/react-google-maps',
            ],

            // To generate a manifest file and use it instead of the "remoteEntry.js" file. This is the new standard for Module Federation 2.0.
            // Set "manifest: true" if we you want to use the default manifest file name, "mf-manifest.json"
            manifest: {
                fileName: 'myAccountComponentsManifest.json', // To use a custom manifest file name instead of the default name "mf-manifest.json"
            },
        }),
    ],
    resolve: {
        alias: {
            // Because we use styled-component instead of Emotion, we need to tell the compiler where to find the styled engine
            // when there is an import at '@mui/styled-engine'
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
    },
    build: {
        // This is important. It tells the compiler to generate the Javascript code that use the latest Javascript features
        target: 'esnext',
        minify: false,
        // This is important. This will make the compiler not generate the style file. Having the style file
        // loaded with the module will break BizConsole's style
        cssCodeSplit: true,
    },
});
