import type {
  RegisteredRouter,
  ValidateLinkOptions,
} from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export type NavigationLink<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> = {
  to: ValidateLinkOptions<TRouter, TOptions>["to"];
  params?: ValidateLinkOptions<TRouter, TOptions>["params"];
  search?: ValidateLinkOptions<TRouter, TOptions>["search"];
};

export type NavigationItem<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> = {
  title: string;
  icon: LucideIcon;
  link: NavigationLink<TRouter, TOptions>;
};

export type NavigationCollapsibleGroup<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> = {
  title: string;
  icon: LucideIcon;
  links: {
    title: string;
    link: NavigationLink<TRouter, TOptions>;
  }[];
};

export type NavigationGroup<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> = {
  title: string;
  links: (
    | NavigationItem<TRouter, TOptions>
    | NavigationCollapsibleGroup<TRouter, TOptions>
  )[];
};

export type NavigationItems = {
  main: NavigationItem[];
  groups?: NavigationGroup[];
  footer: NavigationItem[];
};
