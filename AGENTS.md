# Repository Guidelines

## Project Structure & Module Organization
Keep feature code under `src/`, grouping React components in `src/components/`, route screens in `src/pages/`, shared state in `src/contexts/`, reusable hooks in `src/hooks/`, and domain helpers in `src/utils/` or `src/lib/`. Static assets, especially large media, belong in `public/`. Supabase SQL migrations and config live in `supabase/`; apply new migrations before pushing. Co-locate tests as `<Component>.test.tsx` next to the feature or mirror runtime paths under `src/__tests__/`.

## Build, Test & Development Commands
Use `pnpm install` to sync dependencies with `pnpm-lock.yaml`. Run the dev server via `pnpm dev`. For production checks, run `pnpm build` (full) or `pnpm build:dev` (faster staging bundle), then preview with `pnpm preview`. Execute `pnpm lint` to enforce TypeScript and ESLint rules before submitting reviews.

## Coding Style & Naming Conventions
Write TypeScript-first React function components with two-space indentation and arrow functions. Import internal modules through the `@/` alias (e.g., `import MapPanel from '@/components/MapPanel'`). Favor Tailwind classes inline with JSX and avoid scattered custom CSS. Pull strict types from `@/integrations/supabase/types`; do not introduce `any` unless documented.

## Testing Guidelines
While automated coverage is evolving, prioritize smoke-testing critical flows and record results in `UI_TESTING_REPORT.md`. Prefer Vitest when adding automated tests, naming files `<Component>.test.tsx`. Align Supabase-dependent tests with the local schema and document fixtures or seed data requirements.

## Commit & Pull Request Guidelines
Craft concise, imperative commit messages under 72 characters (e.g., `add map filter`). Group related code, Supabase migrations, and type updates together. PR descriptions should outline intent, link tickets, note manual testing steps, and include before/after screenshots for UI changes. Flag required environment variables or migrations so reviewers can reproduce locally.

## Supabase & Configuration Tips
Keep secrets in `.env` using documented placeholder keys. Run `pnpm migrate` (or your preferred Supabase CLI flow) after pulling migrations to sync the local database. When adding storage buckets or policies, document the setup in the PR and update any onboarding references.
