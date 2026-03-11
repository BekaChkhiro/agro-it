# seo-optimizations

Write your command content here.

This command will be available in chat with /seo-optimizations


Perform a comprehensive SEO audit on the current open project codebase. Check for compliance with these code-related SEO best practices and suggest fixes where needed. Focus on technical, on-page, UX/mobile, and multilingual aspects in the code.

Technical SEO:
1. Verify HTTPS implementation: Ensure all pages redirect from HTTP to HTTPS with 301 status codes; check for mixed content errors.
2. Run site-wide robots.txt audit: Confirm no critical pages are disallowed.
3. Check XML sitemap validity: Ensure it includes all indexable URLs under 50,000 entries.
4. Implement canonical tags on all pages: Use <link rel="canonical"> for duplicates.
5. Audit for duplicate content: Resolve with 301 redirects or noindex tags if similarity >80%.
6. Test core web vitals compliance: Aim for LCP <2.5s, INP <200ms, CLS <0.1.
7. Optimize server response time: Target <200ms TTFB.
8. Configure proper status codes: Custom 404s, 301 for redirects, 410 for deleted.
9. Audit hreflang tags for multilingual sites: Implement bidirectional tags.
10. Check schema markup validity: Add JSON-LD for Organization, Breadcrumb, FAQ.
11. Implement security headers: Add CSP, HSTS, X-Frame-Options.
12. Verify favicon and apple-touch-icon: Ensure various sizes.
13. Audit for broken links: Fix internal/external 404s.
14. Enable compression (Gzip/Brotli): Reduce file sizes.
15. Set up 301 redirects for URL changes: Avoid chains >3 hops.
16. Check cookie consent compliance: Implement banners without blocking functionality.
17. Audit for JavaScript rendering issues: Ensure server-side rendering for dynamic content.
18. Verify image sitemaps: Create separate XML if image-heavy.
19. Test for XML sitemap index files: For large sites.
20. Implement AMP if news/content site: Link canonical to non-AMP.
21. Audit meta robots tags: Noindex/nofollow on non-essential pages.
22. Check for parameter handling: Block unnecessary params.
23. Enable prefetch/preload resources: <link rel="preload"> for critical assets.
24. Run full site crawl: Export issues.
25. Implement progressive web app (PWA): Manifest.json, service worker.

On-Page SEO:
26. Craft unique title tags: 50-60 chars with keyword.
27. Optimize meta descriptions: 150-160 chars with CTA.
28. Use H1-H6 hierarchy: One H1 with main keyword.
29. Add alt text to all images: Descriptive, keyword-rich.
30. Optimize image file names: Hyphens, keywords, compress <100KB.
31. Implement internal linking: 3-5 links with descriptive anchors.
32. Audit URL structure: Short, keyword-rich, hyphenated.
33. Add breadcrumb navigation: Schema-enabled.
34. Use semantic HTML: <article>, <nav>, <section>.
35. Implement Open Graph tags: og:title, og:image, og:description.
36. Add Twitter Card tags: twitter:card=summary_large_image.
37. Use data-nosnippet if needed: On sensitive pages.
38. Add author bio with schema: Person schema.
39. Use rel="nofollow" on untrusted links.
40. Implement lazy loading for images: loading="lazy".
41. Optimize embeds: Responsive containers, VideoObject schema.
42. Add FAQ schema: 3-5 questions.
43. Use Product schema for e-commerce.
44. Audit mobile viewport meta: width=device-width, initial-scale=1.
45. Optimize font loading: WOFF2, preload.

User Experience & Mobile SEO:
46. Test mobile-first design: Responsive breakpoints.
47. Ensure touch-friendly buttons: Min 48x48px.
48. Audit color contrast: WCAG AA 4.5:1.
49. Implement infinite scroll carefully: Add pagination schema.
50. Reduce pop-ups: Delay >5s on mobile.
51. Test navigation menu: Sticky header <50px.
52. Optimize forms: Auto-fill, validation.
53. Optimize for dark mode: prefers-color-scheme media query.

Multilingual SEO:
54. Generate full hreflang matrix: <link rel="alternate" hreflang="xx-YY"> for all languages + x-default.
55. Self-referential hreflang: Reference itself.
56. x-default tag: Point to language selector.
57. Bidirectional hreflang: Mutual references.
58. Hreflang in HTTP headers: For non-HTML files.
59. Hreflang in sitemap: <xhtml:link> in <url>.
60. No conflicting signals: Consistent subdomains/subfolders.
61. Avoid hreflang “en” only: Use region-specific.
62. Hreflang return tags on 404/410 pages.
63. Hreflang on canonicalized URLs.
64. Hreflang annotation in JSON-LD: inLanguage.
65. Geo-IP redirect audit: Allow manual switch, set cookie.
66. Consistent URL pattern: One strategy (subfolders/subdomains).
67. Canonical to same-language version only.
68. Avoid session-based language: Change requires URL change.

Report findings, prioritize issues, and suggest code changes using Cursor Agent.