# Architecture Guide

## Goal

This codebase follows a feature-first frontend architecture. Each domain owns its UI, data fetching, validation, and feature-specific types.

## Layering

- app: Routing and layout only
- features: Business features (machine, installation, etc.)
- components: Shared cross-feature UI
- lib: Reusable technical utilities
- providers: Global app providers

## Import Direction

Allowed directions:

- app -> features, components, providers, constants
- features -> components, lib, constants, types
- components -> lib, constants, types

Avoid:

- components importing feature modules
- one feature importing private files from another feature

## Feature Module Template

Recommended structure for each feature:

- features/<feature>/components
- features/<feature>/hooks
- features/<feature>/services
- features/<feature>/schemas
- features/<feature>/types
- features/<feature>/pages
- features/<feature>/index.ts

## Naming Rules

- Pages: PascalCase ending with Page
- Hooks: camelCase starting with use
- Services: kebab-case ending with .service.ts
- Schemas: kebab-case ending with .schema.ts
- Types: noun-based files grouped by domain object

## API Rules

- Keep API calls in feature services only
- Return normalized data from services
- Throw clear domain errors in services
- Keep query keys centralized by feature when scale grows

## UI Rules

- Shared UI primitives stay in components/ui
- Feature-specific dialogs/cards stay in feature components
- Keep page components compositional, not logic-heavy

## Migration Notes

Recent cleanup applied:

- Route imports now use feature root barrel exports
- Hooks import service functions through feature service barrel
- Removed empty duplicate root services files

Future improvement:

- Introduce query-key factory per feature
- Add unit tests for hooks and service adapters
- Add integration tests for critical route flows
