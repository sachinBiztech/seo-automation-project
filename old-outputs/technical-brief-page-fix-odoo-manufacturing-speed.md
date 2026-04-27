# Technical Implementation Brief: Page Fix - /odoo-manufacturing Speed

## Task
Serve next-gen image formats for hero image, use lazy loading for below-the-fold images, and audit/remediate render-blocking CSS or JS in the head.

## Files to Modify
- `/templates/odoo_manufacturing.html` (image tags, CSS/JS includes)
- `/static/css/main.css` (if needed for CSS optimizations)
- `/static/js/bundle.js` or relevant JS files

## Specific Changes
- Convert hero image to next-gen formats like WebP or AVIF.
- Implement `loading="lazy"` attribute for below-the-fold images.
- Audit head section for render-blocking CSS or JS and defer or asynchronously load non-critical resources.

## Expected Improvement
- Improved page load speed metrics
- Reduced render-blocking time
- Enhanced user experience on /odoo-manufacturing
