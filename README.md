# Toll Fee Web App

This repository contains a web-app with a frontend built in Next.js and a backend service for toll fee calculation.

## Setup and run instructions

### Prerequisites
- Node.js 20+ / PNPM 8+
- Git

### Install dependencies

From the repository root:

```bash
pnpm install
```

### Run the frontend

From the repository root, start the frontend in development mode:

```bash
pnpm dev:frontend
```

The frontend runs on `http://localhost:3000` by default.

### Run the backend

In a second terminal, start the backend service:

```bash
pnpm dev:backend
```

The backend API listens on `http://localhost:4000` and exposes the passage toll endpoint used by the frontend.

### Run both services together

You can also launch both services in parallel from the repository root:

```bash
pnpm dev
```

### Build for production

To build the frontend and backend:

```bash
pnpm build
```

## Assumptions

- The frontend expects the backend to be reachable at `http://localhost:4000`.
- Passages are entered as ISO 8601 timestamps.
- Only one local calendar day of passages may be submitted per request.
- Input timestamps may be unsorted; the frontend sorts them before sending.
- The toll calculation flow is based on a single daily-fee request and a daily cap.
- Vehicle type selection influences backend toll rules.

## Tradeoffs

- The current implementation validates timestamps and date boundaries on the frontend, which improves user experience but duplicates some validation logic that should also exist on the backend.
- The UI uses a custom Bulma wrapper (`@allxsmith/bestax-bulma`) and FontAwesome icons, which simplifies styling but adds dependency coupling.
- The page is implemented with client-side fetch rather than a full API proxy, making local development easier but requiring both backend and frontend to run separately.
- Minimal state management is used (`useState` only) to keep the frontend simple, at the expense of reusability for a larger, multi-page experience.

## Improvements and scalability notes

- Add backend and frontend integration tests for the full toll calculation request path.
- Add a dedicated API client layer to centralize request handling, error translation, and retry logic.
- Support multiple-day submissions or batch uploads if the product requires reporting across date ranges.
- Introduce stronger timezone handling and user timezone selection rather than relying on manually entered offsets.
- Add a proper global style/theme system and responsive layout for mobile devices.
- Add accessibility improvements, including keyboard navigation and ARIA attributes for form controls and result tables.
- Use a shared package or library for validation logic so frontend and backend remain consistent.
- Introduce caching or a small database layer on the backend if the toll calculations need to support persistent passage history or higher load.

## What I would do next with more time

- Add a polished form UX with date/time pickers and a better passage entry workflow.
- Implement backend validation and error handling in a single shared validation module.
- Add unit and integration tests for frontend components and backend routes.
- Build a results summary page showing daily totals, charged passages, and cap information.
- Add E2E tests using Cypress or Playwright to verify the full user flow.
- Harden the deployment by adding Docker support and environment configuration.
- Expand the vehicle model to include additional toll exemptions and support for more jurisdictions.
- Split the main component into smaller reusable components for better maintainability.
- Add Storybook once the component library grows, to improve visual validation and development feedback.
- Enhance styling with more robust SCSS, including better grid and flexbox control.
