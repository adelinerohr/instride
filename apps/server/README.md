# Instride server

Hono + oRPC + Drizzle + Better Auth on plain Postgres. Replaces `apps/backend` (Encore).

- Better Auth handles identity only (sign up, sign in, sessions). No organization plugin.
- Organizations, members (with a `roles` array) and invitations are our own tables in `src/db/schema/organizations.ts`.
- Org-scoped procedures read the `X-Organization-Id` header, same as the old frontends sent.

## Setup

```sh
cp .env.example .env          # fill in DATABASE_URL (a NEW Neon database) and BETTER_AUTH_SECRET
pnpm --filter @instride/shared build
pnpm --filter server db:migrate
pnpm --filter server dev      # http://127.0.0.1:4000
```

## Layout

```
src/
  index.ts              Hono app: CORS, /auth/* (Better Auth), /rpc/* (oRPC)
  auth.ts               Better Auth config
  orpc.ts               publicProcedure, authedProcedure, orgProcedure, requireRoles()
  router.ts             root router + AppRouter type
  routers/              organizations, members, invitations
  db/schema/            auth.ts, organizations.ts, profiles.ts (levels, trainers, riders)
  lib/profiles.ts       creates trainer/rider rows when roles change
scripts/migrate-users.ts  copies users + password hashes from the Encore DB
drizzle/                generated migrations (pnpm db:generate after schema changes)
```

## Adding a feature

1. Add tables in `src/db/schema/`, then `pnpm db:generate` and `pnpm db:migrate`.
2. Add `src/routers/<feature>.ts` using `orgProcedure` or `requireRoles(...)`.
3. Register it in `src/router.ts`.

## Moving the 10 existing users

```sh
OLD_DATABASE_URL=<encore prod url> pnpm migrate:users -- --dry-run   # lists who will be copied
OLD_DATABASE_URL=<encore prod url> pnpm migrate:users
```

Users keep their ids and passwords. Organizations and memberships are not copied; recreate the barn and invite people.
