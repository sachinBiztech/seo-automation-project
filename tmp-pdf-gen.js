const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const htmlPath = path.resolve(__dirname, 'outputs/sprint-plan.html');
  const generatedAt = '2026-04-15'.replace(/[-:]/g, '_');
  const pdfFilename = `BiztechCS-SEO-Sprint-Plan_${generatedAt}.pdf`;
  const pdfPath = path.resolve(__dirname, 'outputs', pdfFilename);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    headless: true
  });

  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();

  console.log('PDF_PATH=' + pdfPath);
  console.log('PDF_FILENAME=' + pdfFilename);
})().catch(err => { console.error('PDF_ERROR=' + err.message); process.exit(1); });
