import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 5001,
    },
    preview: {
        port: 5001,
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
                '@moderepo/biz-console',
                'i18next',
                'react-i18next',
            ],
        }),
    ],
    resolve: {
        alias: {
            // Because we use styled-component instead of Emotion, we need to tell the complier where to find the styled engine
            // when there is an import at '@mui/styled-engine'
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
    },
    build: {
        // This is important. It tells the compiler to generate the Javascript code that use the latest Javascript features
        target: 'esnext',
        minify: true,
        // This is important. This will make the compiler not generate the style file. Having the style file
        // loaded with the module will break BizConsole's style
        cssCodeSplit: true,
    },
});