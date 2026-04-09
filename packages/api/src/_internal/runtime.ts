let getOrganizationIdImpl: (() => string | undefined) | undefined;

export function registerRuntime(options: {
  getOrganizationId: () => string | undefined;
}): void {
  getOrganizationIdImpl = options.getOrganizationId;
}

export function getOrganizationId(): string {
  const id = getOrganizationIdImpl?.();
  if (!id) {
    throw new Error("Organization ID not found");
  }
  return id;
}
