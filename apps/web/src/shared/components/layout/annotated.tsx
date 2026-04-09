import { Link } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";
import { ExternalLink } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/utils";

const annotatedLayoutVariats = cva("py-6", {
  variants: {
    spacing: {
      small: "space-y-6",
      medium: "space-y-8",
      large: "space-y-12",
    },
  },
  defaultVariants: {
    spacing: "medium",
  },
});

const annotatedSectionVariants = cva(
  "grid w-full max-w-5xl grid-cols-1 gap-y-4 px-6 md:grid-cols-12 md:gap-x-8 lg:gap-x-16",
  {
    variants: {
      intent: {
        default: "bg-background",
        highlight: "bg-muted",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  }
);

function slugify(str: string): string {
  return str.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
}

function AnnotatedLayout({
  children,
  className,
  spacing,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof annotatedLayoutVariats>) {
  return (
    <div
      className={cn(annotatedLayoutVariats({ spacing, className }))}
      {...props}
    >
      {children}
    </div>
  );
}

function AnnotatedSection({
  title,
  description,
  docLink,
  children,
  className,
  titleClassName,
  descriptionClassName,
  contentClassName,
  intent,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof annotatedSectionVariants> & {
    title: string;
    description: React.ReactNode;
    docLink?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    contentClassName?: string;
  }) {
  const id = slugify(title);
  return (
    <div
      className={cn(annotatedSectionVariants({ intent, className }))}
      {...props}
    >
      <div className="space-y-4 md:col-span-4">
        <h2 id={id} className={cn("text-sm font-semibold", titleClassName)}>
          {title}
        </h2>
        <p
          className={cn("text-sm text-muted-foreground", descriptionClassName)}
        >
          {description}
        </p>
        {docLink && (
          <Link
            to={docLink}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            target="_blank"
          >
            Read documentation
            <ExternalLink className="size-3" />
          </Link>
        )}
      </div>
      <div
        className={cn("md:col-span-7", contentClassName)}
        aria-labelledby={id}
      >
        {children}
      </div>
    </div>
  );
}

export { AnnotatedLayout, AnnotatedSection };
