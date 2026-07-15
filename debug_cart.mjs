import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Set localStorage so there's an item in the cart
  const cartData = JSON.stringify([{ productId: "santal-oak-soy-candle", quantity: 1, color: "White" }]);
  
  const page = await context.newPage();
  
  // Go to home page to set local storage
  await page.goto('http://localhost:8081/');
  await page.evaluate((data) => {
    localStorage.setItem('bm_cart', data);
  }, cartData);
  
  // Go to cart
  await page.goto('http://localhost:8081/cart.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Get initial HTML to see if data attributes exist
  const btnHtml = await page.evaluate(() => {
    const btn = document.querySelector('.qty-btn');
    return btn ? btn.outerHTML : 'no button found';
  });
  console.log("Button HTML:", btnHtml);
  
  // Click increase
  console.log("Clicking increase...");
  await page.click('button[aria-label="Increase"]');
  await page.waitForTimeout(500);
  
  // Check cart data in localStorage
  const newCartData = await page.evaluate(() => localStorage.getItem('bm_cart'));
  console.log("New Cart Data:", newCartData);
  
  await browser.close();
}

run().catch(console.error);
