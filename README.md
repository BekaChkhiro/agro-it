# Welcome to your Lovable project
 

## Project info

**URL**: https://lovable.dev/projects/66e8ccc1-e62f-43ab-8b27-e8c15b1c8db6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/66e8ccc1-e62f-43ab-8b27-e8c15b1c8db6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Database & Storage)
- React Router (Multi-language routing)
- React Helmet Async (SEO meta tags)
- TanStack Query (Data fetching)

## SEO & Performance

This project implements comprehensive SEO best practices:

### SEO Features
- ✅ Multi-language support (Georgian, English, Russian)
- ✅ Hreflang tags (bidirectional, self-referential)
- ✅ Structured data (JSON-LD) for Products, Organization, FAQs
- ✅ Dynamic sitemap generation from database
- ✅ SEO-friendly URL slugs
- ✅ Cookie consent (GDPR-compliant)
- ✅ Open Graph & Twitter Card tags
- ✅ Lazy loading images below fold
- ✅ Custom 404 page with proper meta robots

### SEO Commands
```bash
# Check for broken links
pnpm check-links

# Generate sitemap from database
pnpm generate-sitemap

# Run full SEO audit
pnpm seo-audit
```

### SEO Documentation
- **SEO_AUDIT_REPORT.md** - Comprehensive 68-point audit
- **SEO_IMPLEMENTATION_CHECKLIST.md** - Prioritized roadmap
- **SEO_QUICK_WINS.md** - Immediate action items
- **SEO_SUMMARY.md** - Executive overview

**Current SEO Score:** 82/100 (Good - Requires Optimization)  
**Target Score:** 92/100 (Excellent)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/66e8ccc1-e62f-43ab-8b27-e8c15b1c8db6) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
