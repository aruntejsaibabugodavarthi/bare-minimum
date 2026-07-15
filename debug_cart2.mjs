import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const cartData = JSON.stringify([{ productId: "santal-oak-soy-candle", quantity: 1, color: "White" }]);
  const page = await context.newPage();
  
  await page.goto('http://localhost:8081/');
  await page.evaluate((data) => {
    localStorage.setItem('bm_cart', data);
  }, cartData);
  
  await page.goto('http://localhost:8081/cart.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  console.log("Qty before click:");
  console.log(await page.evaluate(() => document.querySelector('.cart-item-qty span').innerText));
  
  await page.click('button[aria-label="Increase"]');
  await page.waitForTimeout(500);
  
  console.log("Qty after click:");
  console.log(await page.evaluate(() => document.querySelector('.cart-item-qty span').innerText));
  
  await browser.close();
}

run().catch(console.error);
