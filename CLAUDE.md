# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agri Georgia Hub is a bilingual (Georgian/English) agricultural equipment e-commerce platform built with React, TypeScript, and Vite. The application uses Supabase for backend services (authentication, database) and features an admin panel for content management.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL database, authentication)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with SWC

## Development Commands

```bash
# Start development server (runs on http://[::]:8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Routing and Internationalization

The application uses **URL-based routing** for bilingual support:
- Georgian routes: `/` (root), `/venaxis-teqnika`, `/chven-shesaxeb`, etc.
- English routes: `/en`, `/en/vineyard-equipment`, `/en/about`, etc.

**LanguageContext** (src/contexts/LanguageContext.tsx) provides:
- `language`: Current language ('ka' | 'en') determined by URL prefix
- `t(ka: string, en: string)`: Translation helper function
- `toggleLanguage()`: Switches between languages by updating URL

All new routes must be added in BOTH Georgian and English versions in src/App.tsx. Add custom routes ABOVE the catch-all "*" route.

### Database Schema

The application uses Supabase with the following key tables:

**categories**:
- Bilingual fields: `name_en`, `name_ka`, `description_en`, `description_ka`
- Contains `icon` field for UI display
- Public read access, admin-only write access

**products**:
- Bilingual fields: `name_en`, `name_ka`, `description_en`, `description_ka`
- `specs_en` and `specs_ka`: JSONB fields for product specifications
- Categories are assigned via the `product_categories` junction table (many-to-many with `categories`)
- `image_url`, `video_url`: Media references
- `price`: Decimal field
- `is_featured`: Boolean for homepage display
- Public read access, admin-only write access

**user_roles**:
- Maps users to roles (admin or user)
- Uses `app_role` enum type
- Protected by Row Level Security (RLS)

All tables have automatic `updated_at` timestamp triggers.

### Authentication & Authorization

- Authentication handled via Supabase Auth (src/integrations/supabase/client.ts)
- Admin access controlled by `user_roles` table and `has_role()` function
- Auth pages: `/auth` (login/signup), `/admin` (admin panel)
- RLS policies enforce admin-only mutations on products and categories

### Component Structure

**Page Components** (src/pages/):
- Each page is a top-level component (Index, VineyardEquipment, Admin, etc.)
- Pages handle routing, data fetching, and layout composition

**Reusable Components** (src/components/):
- `Header.tsx`: Main navigation with language switcher
- `Footer.tsx`: Footer with contact info and links
- `CategoryCard.tsx`, `ProductCard.tsx`: Display cards
- `LanguageSwitcher.tsx`: Language toggle UI
- `admin/`: Admin-specific components (CategoriesManager, ProductsManager)
- `ui/`: shadcn/ui components (buttons, forms, dialogs, etc.)

**Data Files** (src/data/):
- `productsData.ts`: Product data structure (89KB file with extensive product catalog)
- `productImages.ts`: Image URL mappings
- `translations.ts`: Common UI translations

### Supabase Integration

**Client Setup**:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

**Environment Variables** (required in .env):
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

**Type Definitions**: Auto-generated TypeScript types in src/integrations/supabase/types.ts match database schema.

### Path Aliases

The project uses `@` alias for src directory:
```typescript
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
```

## Key Development Patterns

### Adding New Products/Categories

Use the Admin panel (`/admin`) or directly interact with Supabase:
1. Ensure user has admin role in `user_roles` table
2. Categories and products require both English and Georgian text fields
3. Product specs use JSONB format for flexibility

### Adding New Pages

1. Create page component in src/pages/
2. Add BOTH Georgian and English routes in src/App.tsx (before "*" route)
3. Use `useLanguage()` hook for translations
4. Follow existing page structure (Import Header/Footer, use consistent layout)

### Working with Translations

```typescript
import { useLanguage } from "@/contexts/LanguageContext";

function MyComponent() {
  const { t } = useLanguage();
  return <h1>{t("ქართული ტექსტი", "English text")}</h1>;
}
```

### Styling Conventions

- Use Tailwind utility classes
- shadcn/ui components for consistent design system
- Responsive design with mobile-first approach
- Custom theme configuration in tailwind.config.ts

## Database Migrations

Migrations located in `supabase/migrations/`:
- Use timestamped SQL files
- First migration creates core schema (categories, products, user_roles)
- Include RLS policies, triggers, and functions in migrations

## Build Considerations

- Production builds exclude development tooling (lovable-tagger)
- Vite config uses SWC for fast compilation
- Server runs on port 8080 with IPv6 support (`::`)
