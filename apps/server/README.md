# Instride server

Hono + oRPC + Drizzle + Better Auth on plain Postgres. Replaces `apps/backend` (Encore).

This app is a thin shell. The real code lives in packages:

```
packages/
  db/      @instride/db     tables, enums (zero imports), drizzle-zod schemas, relations, createDb(), migrations
  auth/    @instride/auth   createAuth(env, db): Better Auth for login only, no organization plugin
  api/     @instride/api    oRPC procedures, middleware, routers/<feature>/{index,schemas,procedures/*}
apps/
  server/  env.ts, services.ts (creates db + auth once), context.ts, index.ts (Hono: CORS, /auth/*, /rpc/*)
```

Old packages, kept only until Encore is gone:

- `@instride/client` (was `@instride/api`): TanStack Query hooks + Encore client used by web/native today
- `@instride/legacy-auth` (was `@instride/auth`): Better Auth config with the organization plugin

## Setup

```sh
cp packages/db/.env.example packages/db/.env       # DATABASE_URL = a NEW Neon database
cp apps/server/.env.example apps/server/.env       # same DATABASE_URL + BETTER_AUTH_SECRET
pnpm install
pnpm --filter @instride/db db:migrate
pnpm --filter server dev                           # http://127.0.0.1:4000
```

## Procedures (packages/api/src/procedures.ts)

| Procedure                     | Who                                                                   |
| ----------------------------- | --------------------------------------------------------------------- |
| `publicProcedure`             | anyone                                                                |
| `protectedProcedure`          | signed in (adds `user`)                                               |
| `organizationProcedure`       | member of the `X-Organization-Id` org (adds `organization`, `member`) |
| `roleProcedure("admin", ...)` | member with at least one of those roles                               |

## Adding a feature

1. Tables in `packages/db/src/schema/<feature>.ts`, export from `schema/index.ts`, relations in `relations.ts`.
2. `pnpm --filter @instride/db db:generate` then `db:migrate`.
3. Select/insert schemas in `packages/db/src/schemas.ts`.
4. `packages/api/src/routers/<feature>/` with `schemas.ts`, `procedures/*.ts`, `index.ts`.
5. Register it in `packages/api/src/routers/index.ts`.

## What clients import

- Types: `import type { AppRouter } from "@instride/api/routers/index"`
- Form validation: `@instride/api/routers/<feature>/schemas`
- Enums: `@instride/db/enums` (safe for web and native bundles)

## Moving the 10 existing users

```sh
cd packages/db
OLD_DATABASE_URL=<encore prod url> pnpm migrate:users -- --dry-run   # lists who will be copied
OLD_DATABASE_URL=<encore prod url> pnpm migrate:users
```

Users keep their ids and passwords. Organizations and memberships are not copied; recreate the barn and invite people.
