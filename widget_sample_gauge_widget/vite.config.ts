import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 5002,
    },
    preview: {
        port: 5002,
    },
    plugins: [
        react(),
        federation({
            name: 'Gauge Widget',

            // The build script will build the project and create an entry file. This filename tells the build script to name the
            // entry file with this name
            filename: 'gaugeWidget.js',

            // Modules to expose
            exposes: {
                './gaugeWidget': './src/gauge-widget',
            },

            // Specify which library is shared. BizConsole will not load these library from the plugin and use the one installed internally instead.
            shared: [
                'react',
                'react-dom',
                '@mui/material',
                'zustand',
                '@moderepo/bizstack-console-sdk',
                '@amcharts/amcharts5',
                '@amcharts/amcharts5/xy',
                '@amcharts/amcharts5/radar',
            ],
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
