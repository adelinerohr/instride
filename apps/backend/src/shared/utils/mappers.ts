export function toISO(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function toISOOrNull(value: Date | string | null): string | null {
  return value ? toISO(value) : null;
}

export function toTimestamps(createdAt: Date, updatedAt: Date) {
  return {
    createdAt: toISO(createdAt),
    updatedAt: toISO(updatedAt),
  };
}
