# Technical Implementation Brief: CWV Fix - LCP on /odoo-manufacturing

## Task
Compress and properly size hero image on /odoo-manufacturing; defer non-critical JS and optimize server TTFB for this page.

## Current Metric
- LCP: 2.8s

## Target Metric
- LCP: 2.5s

## Files to Modify
- `/templates/odoo_manufacturing.html` (Hero image and JS script references)
- JS bundles related to non-critical scripts (defer/async attributes)
- Server configuration for TTFB optimization (e.g., Nginx/Apache configs or CDN settings)

## Specific Changes
- Compress hero image using WebP or AVIF next-gen formats.
- Resize hero image for optimal display dimensions.
- Add `defer` or `async` attributes to non-critical JS bundles.
- Review and optimize server caching, compression, and CDN delivery to reduce TTFB.

## Expected Improvement
- LCP improvement by approx. 0.3s
- Overall faster page load and responsiveness on /odoo-manufacturing
