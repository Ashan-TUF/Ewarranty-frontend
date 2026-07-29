# eWarranty Frontend

Next.js App Router frontend for machine, model, and warranty management.

## Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS v4
- TanStack Query
- Zustand
- Framer Motion

## Scripts

- npm run dev: Start development server
- npm run build: Production build
- npm run start: Run production server
- npm run lint: Run ESLint

## Project Structure

- app: Route layer (thin page wrappers)
- features: Domain modules (UI, hooks, services, schemas, types)
- components: Shared UI and layout components
- providers: App-wide providers (theme, query)
- lib: Core utilities and API clients
- constants: Routes and API constants
- hooks: Cross-feature shared hooks
- types: Global shared types

## Architecture Rules

- Keep route files in app thin. They should only map route params and render feature pages.
- Put domain logic inside features/<domain>.
- Use barrel exports for feature public API. Prefer imports from feature root (example: @/features/machine).
- Keep service modules inside each feature unless shared by multiple features.
- Shared UI goes in components/ui. Feature-specific UI goes in features/<domain>/components.
- Prefer hooks for server state and mutation logic. Keep page components focused on composition.
- Keep schemas close to feature forms and requests.

## Current Feature Pattern (Machine)

- features/machine/components: Presentation
- features/machine/hooks: Query and mutation orchestration
- features/machine/services: API calls
- features/machine/schemas: Zod validation
- features/machine/types: Feature-owned data contracts

## Quality Checklist

- Route-level pages should not contain business logic.
- No duplicate service layers across root and feature folders.
- Keep imports consistent through barrel exports when available.
- Add loading, error, and empty states for every async page.
- Run npm run lint before each commit.

## Next Refactor Targets

- Standardize API client usage in feature services (single style, axios or fetch wrapper).
- Add shared error mapper for service-level errors.
- Add feature-level tests for hooks and critical page flows.
