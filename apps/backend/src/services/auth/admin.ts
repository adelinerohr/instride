import {
  endOfDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  SQL,
} from "drizzle-orm";
import { api } from "encore.dev/api";
import { Min, Max, MaxLen } from "encore.dev/validate";

import { authUsers } from "@/database/schema";

import { db } from "./db";
import { AuthUser } from "./types/models";

interface ListUsersParams {
  query?: string & MaxLen<200>;
  limit: number & (Min<1> & Max<100>);
  offset: number & Min<0>;
  sortBy: string;
  sortOrder: "asc" | "desc";
  role?: ("admin" | "user")[];
  banned?: ("active" | "banned")[];
  emailVerified?: ("verified" | "pending")[];
  createdAt?: ("today" | "this-week" | "this-month" | "older")[];
}

interface ListUsersResponse {
  users: AuthUser[];
  total: number;
}

export const listUsers = api(
  {
    method: "GET",
    path: "/admin/users",
    expose: true,
    auth: true,
  },
  async (params: ListUsersParams): Promise<ListUsersResponse> => {
    const conditions = [];

    if (params.query) {
      conditions.push(
        or(
          ilike(authUsers.name, `%${params.query}%`),
          ilike(authUsers.email, `%${params.query}%`)
        )
      );
    }

    if (params.role && params.role.length > 0) {
      conditions.push(inArray(authUsers.role, params.role));
    }

    if (params.emailVerified && params.emailVerified.length > 0) {
      const emailVerifiedConditions = params.emailVerified
        .map((status) => {
          if (status === "verified") {
            return eq(authUsers.emailVerified, true);
          }
          if (status === "pending") {
            return eq(authUsers.emailVerified, false);
          }
          return null;
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      if (emailVerifiedConditions.length > 0) {
        conditions.push(or(...emailVerifiedConditions));
      }
    }

    if (params.banned && params.banned.length > 0) {
      const bannedConditions = params.banned
        .map((status) => {
          if (status === "active") {
            return eq(authUsers.banned, true);
          }
          if (status === "banned") {
            return eq(authUsers.banned, false);
          }
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      if (bannedConditions.length > 0) {
        conditions.push(or(...bannedConditions));
      }
    }

    if (params.createdAt && params.createdAt.length > 0) {
      const dateConditions = params.createdAt
        .map((range) => {
          const now = new Date();
          switch (range) {
            case "today":
              const todayStart = startOfDay(now);
              const todayEnd = endOfDay(now);
              return and(
                gte(authUsers.createdAt, todayStart),
                lte(authUsers.createdAt, todayEnd)
              );
            case "this-week":
              const weekStart = startOfWeek(now, { weekStartsOn: 1 });
              return gte(authUsers.createdAt, weekStart);
            case "this-month":
              const monthStart = startOfMonth(now);
              return gte(authUsers.createdAt, monthStart);
            case "older":
              const monthAgo = subMonths(now, 1);
              return lte(authUsers.createdAt, monthAgo);
            default:
              return null;
          }
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      if (dateConditions.length > 0) {
        conditions.push(or(...dateConditions));
      }
    }

    const whereConditions =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Build sort order
    const sortDirection = params.sortOrder === "desc" ? desc : asc;
    let orderByColumn: SQL;
    switch (params.sortBy) {
      case "name":
        orderByColumn = sortDirection(authUsers.name);
        break;
      case "email":
        orderByColumn = sortDirection(authUsers.email);
        break;
      case "role":
        orderByColumn = sortDirection(authUsers.role);
        break;
      default:
        orderByColumn = sortDirection(authUsers.createdAt);
        break;
    }

    const users = await db
      .select()
      .from(authUsers)
      .where(whereConditions)
      .limit(params.limit)
      .offset(params.offset)
      .orderBy(orderByColumn);

    const total = await db.$count(authUsers, whereConditions);

    return {
      users,
      total,
    };
  }
);

interface ExportUsersParams {
  userIds: Array<string> & MaxLen<1000>;
}

interface ExportUsersResponse {
  csv: string;
  filename: string;
}

export const exportUsers = api(
  {
    method: "POST",
    path: "/admin/users/export",
    expose: true,
    auth: true,
  },
  async (params: ExportUsersParams): Promise<ExportUsersResponse> => {
    const users = await db.query.authUsers.findMany({
      where: {
        id: {
          in: params.userIds,
        },
      },
      columns: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        banned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    type CSVRow = {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      role: string | null;
      banned: boolean | null;
      createdAt: string;
      updatedAt: string;
    };

    const rows: CSVRow[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt.toLocaleDateString("en-US"),
      updatedAt: user.updatedAt.toLocaleDateString("en-US"),
    }));

    const headers = Object.keys(rows[0]) as Array<keyof CSVRow>;
    const escape = (value: unknown): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // Quote if contains a comma, quote, or newline, or carriage return
      if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerRow = headers.map(escape).join(",");
    const dataRows = rows.map((row) =>
      headers.map((header) => escape(row[header])).join(",")
    );

    return {
      csv: [headerRow, ...dataRows].join("\n"),
      filename: `users-${new Date().toISOString().split("T")[0]}.csv`,
    };
  }
);
