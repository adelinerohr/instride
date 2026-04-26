── api/
├── src/
│ ├── contracts/ # imported by backend + frontend
│ │ ├── \_fragments.ts # With\* relation fragments (shared across domains)
│ │ ├── lessons.ts # lesson base types + responses
│ │ ├── boards.ts
│ │ ├── organizations.ts
│ │ ├── members.ts
│ │ └── index.ts # re-exports all contracts
│ │
│ ├── client/ # frontend-only
│ │ ├── api-client.ts # Encore-generated client wrapper
│ │ ├── auth-client.ts # Better Auth client
│ │ ├── keys.ts # shared key helpers
│ │ └── index.ts
│ │
│ ├── modules/ # frontend queries + mutations per domain
│ │ ├── lessons/
│ │ │ ├── keys.ts # lessonKeys factory
│ │ │ ├── queries.ts # queryOptions + useQuery helpers
│ │ │ ├── mutations.ts # mutation fns + useMutation helpers
│ │ │ └── index.ts
│ │ ├── boards/
│ │ └── ...
│ │
│ └── index.ts # frontend top-level re-exports

@instride/api — the API contract surface. Everything that describes how the backend and frontend communicate, plus the frontend's query/mutation layer.

/contracts — request/response interfaces, base entity interfaces, relation fragments. Imported by both backend (for endpoint signatures) and frontend (for consumption).
/client — queryOptions(), key factories, mutation functions, hooks. Frontend-only.
/auth-client — Better Auth React client setup. Frontend-only.

\_primitives.ts (leaf: no internal imports)
↑
\_fragments.ts (depends on \_primitives only)
↑
auth.ts (independent)
↑
organizations.ts ←→ boards.ts (mutually dependent, both depend on \_primitives + \_fragments)
↑
lessons.ts (depends on \_primitives, \_fragments, organizations, boards)
