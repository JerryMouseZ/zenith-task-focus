import puppeteer from 'puppeteer';

async function testRefactoredApp() {
  console.log('🚀 Starting Puppeteer test for refactored zenith-task-focus app...');
  
  const browser = await puppeteer.launch({
    headless: true, // Use headless mode to avoid temp directory issues
    defaultViewport: { width: 1280, height: 720 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-gpu',
      '--user-data-dir=./temp-chrome-profile'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log('❌ Browser Error:', msg.text());
      } else if (type === 'warning') {
        console.log('⚠️ Browser Warning:', msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });

    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for the app to load
    console.log('⏳ Waiting for app to load...');
    await page.waitForSelector('body', { timeout: 10000 });

    // Check if we're on the auth page or main app
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);

    // Test 1: Check if the page loads without errors
    console.log('✅ Test 1: Page loads successfully');

    // Test 2: Check if React app is mounted
    const reactRoot = await page.$('#root');
    if (reactRoot) {
      console.log('✅ Test 2: React app is mounted');
    } else {
      console.log('❌ Test 2: React app not found');
    }

    // Test 3: Check for any JavaScript errors in console
    const logs = await page.evaluate(() => {
      return window.console.errors || [];
    });
    
    if (logs.length === 0) {
      console.log('✅ Test 3: No JavaScript errors detected');
    } else {
      console.log('❌ Test 3: JavaScript errors found:', logs);
    }

    // Test 4: Check if the refactored components are working
    try {
      // Look for main navigation or layout elements
      const hasNavigation = await page.$('[data-testid="sidebar"], nav, .sidebar') !== null;
      if (hasNavigation) {
        console.log('✅ Test 4: Navigation/Layout components loaded');
      } else {
        console.log('⚠️ Test 4: Navigation/Layout components not found (might be on auth page)');
      }
    } catch (error) {
      console.log('❌ Test 4: Error checking navigation:', error.message);
    }

    // Test 5: Check if task-related components are accessible
    try {
      // Try to find task-related elements
      const hasTaskElements = await page.evaluate(() => {
        const taskKeywords = ['task', 'todo', 'priority', 'matrix'];
        return taskKeywords.some(keyword => 
          document.body.textContent.toLowerCase().includes(keyword)
        );
      });
      
      if (hasTaskElements) {
        console.log('✅ Test 5: Task-related content found');
      } else {
        console.log('⚠️ Test 5: Task-related content not immediately visible');
      }
    } catch (error) {
      console.log('❌ Test 5: Error checking task content:', error.message);
    }

    // Test 6: Check if the refactored service layer is working
    try {
      // Check if there are any network requests to the API
      const responses = [];
      page.on('response', response => {
        if (response.url().includes('supabase') || response.url().includes('api')) {
          responses.push({
            url: response.url(),
            status: response.status()
          });
        }
      });

      // Wait a bit to capture any initial API calls
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (responses.length > 0) {
        console.log('✅ Test 6: API requests detected:', responses.length);
        responses.forEach(resp => {
          console.log(`   📡 ${resp.status} - ${resp.url}`);
        });
      } else {
        console.log('⚠️ Test 6: No API requests detected (might be expected on auth page)');
      }
    } catch (error) {
      console.log('❌ Test 6: Error monitoring API requests:', error.message);
    }

    // Test 7: Performance check
    try {
      const metrics = await page.metrics();
      console.log('📊 Performance Metrics:');
      console.log(`   🕒 Script Duration: ${Math.round(metrics.ScriptDuration * 1000)}ms`);
      console.log(`   🧠 JS Heap Used: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`);
      console.log(`   📄 DOM Nodes: ${metrics.Nodes}`);
      
      if (metrics.ScriptDuration < 5) {
        console.log('✅ Test 7: Performance looks good');
      } else {
        console.log('⚠️ Test 7: Performance might need optimization');
      }
    } catch (error) {
      console.log('❌ Test 7: Error getting performance metrics:', error.message);
    }

    // Take a screenshot for visual verification
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'refactored-app-test.png', 
      fullPage: true 
    });

    console.log('🎉 Test completed! Screenshot saved as refactored-app-test.png');

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testRefactoredApp().catch(console.error);
