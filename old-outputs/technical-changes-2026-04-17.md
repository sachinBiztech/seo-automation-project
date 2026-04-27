## Technical Changes — 2026-04-17

### CWV Fix: LCP on /odoo-manufacturing (2.8s → <2.5s)
- URL: /odoo-manufacturing
- Fix applied: Compressed and properly sized hero image; deferred non-critical JS; optimized server TTFB
- Before: LCP 2.8s
- Expected after: LCP <2.5s
- Files modified: Hero image asset, JS bundles, server config

### Page Fix: /odoo-manufacturing — speed
- URL: /odoo-manufacturing
- Fix applied: Served next-gen image formats; lazy loaded below-fold images; audited and remediated render-blocking CSS/JS
- Before: High LCP and render-blocking resources
- Expected after: Improved page speed and Core Web Vitals
- Files modified: Image assets, page CSS/JS templates

### Structural Fix: internal_linking — /odoo-manufacturing, /odoo-crm-module
- URL: /odoo-manufacturing
- Fix applied: Added contextual inbound links from /odoo-crm-module and top traffic landing pages
- Before: Weak internal linking
- Expected after: Improved link equity and crawlability
- Files modified: Content templates for /odoo-crm-module and top landing pages
