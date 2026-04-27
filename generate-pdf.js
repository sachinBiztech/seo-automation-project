#!/usr/bin/env node
'use strict';

const puppeteer = require('puppeteer-core');

const [htmlPath, pdfPath] = process.argv.slice(2);

if (!htmlPath || !pdfPath) {
  console.error('Usage: node generate-pdf.js <html-path> <pdf-path>');
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();

  console.log('PDF written to:', pdfPath);
})().catch(err => {
  console.error('PDF generation failed:', err.message);
  process.exit(1);
});
