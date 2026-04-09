import { z } from "zod";

export const sortItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export const filterValueSchema = z
  .union([z.string(), z.array(z.string())])
  .nullable();

export const filterItemSchema = z
  .record(z.string(), filterValueSchema)
  .catch({});

export const tableSearchParams = z.object({
  page: z.number().default(1).catch(1),
  perPage: z.number().default(10).catch(10),
  sort: z
    .array(sortItemSchema)
    .default([{ id: "createdAt", desc: true }])
    .catch([{ id: "createdAt", desc: true }]),
  filters: filterItemSchema.default({}).catch({}),
  search: z.string().default("").catch(""),
});

export type TableSearchParams = z.infer<typeof tableSearchParams>;
export type FilterItem = z.infer<typeof filterItemSchema>;
export type FilterValue = z.infer<typeof filterValueSchema>;
export type SortItem = z.infer<typeof sortItemSchema>;

// ---- Middleware ------------------------------------------------------------

type TableSearchMiddleware = (ctx: {
  search: TableSearchParams;
  next: (search: TableSearchParams) => TableSearchParams;
}) => TableSearchParams;

export function resetPageOnFilterChange(): TableSearchMiddleware {
  return ({ search, next }) => {
    const result = next(search);
    const sortChanged =
      JSON.stringify(result.sort ?? []) !== JSON.stringify(search.sort ?? []);
    const filtersChanged =
      JSON.stringify(result.filters ?? {}) !==
      JSON.stringify(search.filters ?? {});

    if (sortChanged || filtersChanged) {
      return { ...result, page: 1 };
    }
    return result;
  };
}

export function validateSortColumns(
  validColumnIds: Set<string> | string[]
): TableSearchMiddleware {
  const ids =
    validColumnIds instanceof Set ? validColumnIds : new Set(validColumnIds);

  return ({ search, next }) => {
    const result = next(search);
    if (!result.sort?.length) return result;

    return {
      ...result,
      sort: result.sort.filter((s) => ids.has(s.id)),
    };
  };
}

export function validateFilterKeys(
  validKeys: Set<string> | string[]
): TableSearchMiddleware {
  const keys = validKeys instanceof Set ? validKeys : new Set(validKeys);

  return ({ search, next }) => {
    const result = next(search);
    if (!result.filters?.length) return result;

    return {
      ...result,
      filters: Object.fromEntries(
        Object.entries(result.filters).filter(([key]) => keys.has(key))
      ),
    };
  };
}
