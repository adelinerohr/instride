export function formatError(input: string | string[]): { message: string }[] {
  if (Array.isArray(input)) {
    return input.map((error) => ({
      message: error,
    }));
  }

  return [{ message: input }];
}
