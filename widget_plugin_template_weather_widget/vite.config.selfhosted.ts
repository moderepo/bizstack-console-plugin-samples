import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { bizstackConsoleSDKTransform } from './scripts/modify-sdk';

// https://vite.dev/config/
export default defineConfig({
    // Need to modify the BizStack Console SDK.
    optimizeDeps: { exclude: ['@moderepo/bizstack-console-sdk'] },
    server: {
        port: 5000,
    },
    plugins: [
        react(),
        {
            name: 'patch-bizstack-console-sdk',
            enforce: 'pre',
            transform(code, id) {
                return bizstackConsoleSDKTransform(code, id);
            },
        },
    ],
    resolve: {
        alias: {
            // Because we use styled-component instead of Emotion, we need to tell the compiler where to find the styled engine
            // when there is an import at '@mui/styled-engine'
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
    },
    root: 'src/dev',
    build: {
        // This is important. It tells the compiler to generate the Javascript code that use the latest Javascript features
        target: 'esnext',
        minify: false,
        // This is important. This will make the compiler not generate the style file. Having the style file
        // loaded with the module will break BizConsole's style
        cssCodeSplit: true,
    },
});
