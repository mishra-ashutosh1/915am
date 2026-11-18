# 915am — Allocation Planner

A personal portfolio allocation planning prototype for comparing current and target weights and exploring planned additions across mutual funds, stocks, and other holdings.

- Demo: https://915am.vercel.app/
- Source: https://github.com/mishra-ashutosh1/915am

## Features

- Current and target allocation charts
- Shortfall-based fresh-money splitting
- Configurable single-stock concentration warnings
- Browser-local portfolio storage
- CSV export

Built with React, TypeScript, Vite, Zustand, Recharts, and Tailwind CSS.

## Brand

The header and favicon show a clock fixed at 9:15 AM as a market-opening-inspired symbol. It is decorative branding, not a live clock, exchange connection, or market-status indicator.

## Development

```sh
npm ci
npm run dev
```

```sh
npm run build
npm test
npm run lint
```

## Scope and limitations

Independent personal project, not employer work. Sample holdings are fictional. This is a planning and demonstration tool, not investment advice, a return optimizer, or an investment recommendation service. Concentration warnings do not prevent entries or trades. Mobile usability and further validation remain in progress; calculation edge cases and production behavior are not fully validated.

The branding update does not change allocation calculations or browser-storage keys. Entries are stored in the current browser for the current site origin; data saved on the previous demo domain will not automatically appear on the new domain. No cross-domain data migration is included.
