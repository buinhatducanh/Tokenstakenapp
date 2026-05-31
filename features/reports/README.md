# Reports Feature

This package implements Task 6 (Reports) for Tokens_taken. It provides report
aggregation logic, React hooks, and UI components for P&L, Cash Flow, and
Balance Sheet.

## What It Includes

- `ReportService` for aggregating ledger data.
- React Query hooks for calling `/api/reports/*` endpoints.
- Simple report components for rendering results.
- CSV export helper (browser-only) and PDF placeholder.

## Quick Start

Run the demo script:

```powershell
pnpm --filter @tokens-taken/feature-reports demo
```

Run tests:

```powershell
pnpm --filter @tokens-taken/feature-reports test
```

