export function isValidString(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidStrings(values: string[]): boolean {
  for (const value of values) {
    if (!isValidString(value)) return false;
  }
  return true;
}

export function returnStringOrNull(
  value: string | null | undefined
): string | null {
  if (value && isValidString(value)) {
    return value;
  }
  return null;
}
