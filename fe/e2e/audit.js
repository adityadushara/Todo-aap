const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BREAKPOINTS = [
  { width: 320, height: 640, name: '320px_mobile_small' },
  { width: 375, height: 812, name: '375px_mobile_medium' },
  { width: 390, height: 844, name: '390px_mobile_iphone12' },
  { width: 414, height: 896, name: '414px_mobile_large' },
  { width: 768, height: 1024, name: '768px_tablet_portrait' },
  { width: 820, height: 1180, name: '820px_tablet_ipad' },
  { width: 1024, height: 1366, name: '1024px_tablet_desktop' },
  { width: 1280, height: 800, name: '1280px_laptop' },
  { width: 1440, height: 900, name: '1440px_desktop' },
  { width: 1920, height: 1080, name: '1920px_ultrawide' }
];

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('Launching Playwright Chromium browser for complete visual audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const overflowIssues = [];

  for (const bp of BREAKPOINTS) {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    console.log(`\n========================================`);
    console.log(`Auditing Viewport: ${bp.name} (${bp.width}x${bp.height})`);
    console.log(`========================================`);

    // 1. Audit Unauthenticated Auth Screens
    const authRoutes = ['/(auth)/sign-in', '/(auth)/sign-up', '/(auth)/forgot-password'];
    for (const route of authRoutes) {
      const url = `http://localhost:8081${route}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(600);

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        if (scrollWidth > clientWidth) {
          overflowIssues.push({ breakpoint: bp.name, route, scrollWidth, clientWidth, diff: scrollWidth - clientWidth });
        }

        const shotPath = path.join(SCREENSHOT_DIR, `${bp.name}_${route.replace(/\//g, '_')}.png`);
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`  ✓ Auth Screen: ${route}`);
      } catch (err) {
        console.error(`  ✕ Error loading ${url}: ${err.message}`);
      }
    }

    // 2. Click Explore Live Demo & Audit Authenticated Tabs via SPA Navigation
    try {
      await page.goto('http://localhost:8081/(auth)/sign-in', { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(600);
      
      const demoBtn = page.getByText('Explore Live Demo');
      if (await demoBtn.isVisible()) {
        await demoBtn.click();
        await page.waitForTimeout(1000); // wait for dashboard render

        // Screenshot Dashboard
        const dashPath = path.join(SCREENSHOT_DIR, `${bp.name}__(tabs).png`);
        await page.screenshot({ path: dashPath, fullPage: false });
        console.log(`  ✓ Authenticated Tab: Home Dashboard`);

        // Click Tasks Tab
        const tasksTab = page.getByText('Tasks').first();
        if (await tasksTab.isVisible()) {
          await tasksTab.click();
          await page.waitForTimeout(600);
          const tasksPath = path.join(SCREENSHOT_DIR, `${bp.name}__(tabs)_todos.png`);
          await page.screenshot({ path: tasksPath, fullPage: false });
          console.log(`  ✓ Authenticated Tab: Tasks List`);
        }

        // Click Done Tab
        const doneTab = page.getByText('Done').first();
        if (await doneTab.isVisible()) {
          await doneTab.click();
          await page.waitForTimeout(600);
          const donePath = path.join(SCREENSHOT_DIR, `${bp.name}__(tabs)_completed.png`);
          await page.screenshot({ path: donePath, fullPage: false });
          console.log(`  ✓ Authenticated Tab: Completed Tasks`);
        }

        // Click Settings / Profile Tab
        const settingsTab = page.getByText('Profile').first();
        if (await settingsTab.isVisible()) {
          await settingsTab.click();
          await page.waitForTimeout(600);
          const settingsPath = path.join(SCREENSHOT_DIR, `${bp.name}__(tabs)_settings.png`);
          await page.screenshot({ path: settingsPath, fullPage: false });
          console.log(`  ✓ Authenticated Tab: Settings & Profile`);
        }
      }
    } catch (e) {
      console.log('  Demo SPA navigation warning:', e.message);
    }
  }

  await browser.close();

  console.log('\n--- FINAL AUDIT VERIFICATION SUMMARY ---');
  console.log(`Console Errors Found: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors.slice(0, 10));
  }

  console.log(`Horizontal Overflow Issues: ${overflowIssues.length}`);
  if (overflowIssues.length > 0) {
    console.log(JSON.stringify(overflowIssues, null, 2));
  }
})();
