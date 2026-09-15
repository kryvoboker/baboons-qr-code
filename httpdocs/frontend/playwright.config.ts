import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    reporter: 'list',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
        browserName: 'chromium',
        launchOptions: {
            executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
            args: ['--no-sandbox'],
        },
    },
});
