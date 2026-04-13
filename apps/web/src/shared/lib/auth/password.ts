class PasswordValidator {
  public containsLowerAndUpperCase(str?: string | null): boolean {
    return this.isNotNullOrEmpty(str) && str !== str!.toLowerCase();
  }

  public hasMinimumLength(str?: string | null): boolean {
    return this.isNotNullOrEmpty(str) && str!.length >= 8;
  }

  public containsNumber(str?: string | null): boolean {
    return this.isNotNullOrEmpty(str) && /\d/.test(str!);
  }

  public validate(str?: string | null): { success: boolean; errors: string[] } {
    let success = true;
    const errors: string[] = [];

    if (!this.containsLowerAndUpperCase(str)) {
      success = false;
      errors.push(
        "The password should contain lower and upper case characters."
      );
    }

    if (!this.hasMinimumLength(str)) {
      success = false;
      errors.push(`The password should be at least 8 characters long.`);
    }

    if (!this.containsNumber(str)) {
      success = false;
      errors.push("The password should contain at least one number.");
    }

    return { success, errors };
  }

  private isNotNullOrEmpty(str?: string | null): boolean {
    return !!str;
  }
}

export const passwordValidator = new PasswordValidator();
