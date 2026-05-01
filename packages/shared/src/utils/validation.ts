export function checkIfValidString(value: string): boolean {
  return value.trim().length > 0;
}

export function checkIfValidStrings(values: string[]): boolean {
  for (const value of values) {
    if (!checkIfValidString(value)) return false;
  }
  return true;
}
