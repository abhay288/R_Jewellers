const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.setViewport({ width: 1920, height: 1080 });
  console.log('Navigating to http://localhost:3000/');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  console.log('Waiting for video sections...');
  await page.waitForSelector('video');
  
  console.log('Scrolling down...');
  await page.evaluate(() => {
    window.scrollBy(0, 1500);
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'screenshot_test.png' });
  console.log('Saved screenshot to screenshot_test.png');
  
  // Dump video states
  const videoStates = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('video')).map(v => ({
      src: v.src,
      paused: v.paused,
      readyState: v.readyState,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      error: v.error ? v.error.message : null
    }));
  });
  
  console.log('VIDEO STATES:', JSON.stringify(videoStates, null, 2));
  
  await browser.close();
})();
